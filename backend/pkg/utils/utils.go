package utils

import (
	"database/sql"
	"net/http"
	"os"
	"time"

	"github.com/Nerzal/gocloak/v13"
	"github.com/tbaehler/gin-keycloak/pkg/ginkeycloak"
	"go.uber.org/zap"

	// Import postgres driver
	_ "github.com/lib/pq"
)

var GinKeycloakConfig *ginkeycloak.KeycloakConfig

var ClientKeycloakConfig *KeycloakConfig

type KeycloakConfig struct {
		// Keycloak host
		KeycloakURL string
		// Client id
		ClientID string	
		// Client secret
		ClientSecret string	
		// Realm
		Realm string	
		// Keycloak client
		Client *gocloak.GoCloak
}


// DBConfig is the structure that define the configuration for the database
type DBConfig struct {
	Host     string
	Port     string
	Username string
	Password string
	Database string
	Db       *sql.DB
}

// dbConfig is the configuration for the database
var DbConfig *DBConfig

// Zap Logger logger
var Logger *zap.SugaredLogger

func SetupDBConfig() {
	// Get DB variable from env variables
	host := os.Getenv("DB_HOST")
	if host == "" {
		Logger.Panic("DB_HOST is not set")
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		Logger.Panic("DB_PORT is not set")
	}
	username := os.Getenv("DB_USERNAME")
	if username == "" {
		Logger.Panic("DB_USERNAME is not set")
	}
	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		Logger.Panic("DB_PASSWORD is not set")
	}
	database := os.Getenv("DB_DATABASE")
	if database == "" {
		Logger.Panic("DB_DATABASE is not set")
	}

	// Try to connect to the database 3 times each 5 seconds then panic
	for i := 0; i < 3; i++ {
		db, err := sql.Open("postgres", "host="+host+" port="+port+" user="+username+" password="+password+" dbname="+database+" sslmode=disable")
		if err != nil {
			Logger.Error("Error connecting to the database: ", err)
			time.Sleep(5 * time.Second)
		} else {
			DbConfig = &DBConfig{
				Host:     host,
				Port:     port,
				Username: username,
				Password: password,
				Database: database,
				Db:       db,
			}
			break
		}
	}
	if DbConfig == nil {
		Logger.Panic("Error connecting to the database")
	}

	Logger.Info("Database connection established")

	setupDb()
}

func setupDb() {
	// Create service providers table
	_, err := DbConfig.Db.Exec("CREATE TABLE IF NOT EXISTS service_providers (id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, url TEXT NOT NULL, userid TEXT, idofclient TEXT NOT NULL, clientid TEXT NOT NULL, clientsecret TEXT NOT NULL, token TEXT, created_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_at TIMESTAMP NOT NULL DEFAULT NOW())")
	if err != nil {
		Logger.Panic("Error creating service_providers table: ", err)
	}
	Logger.Info("Table service_providers created")
}

func SetupKeycloak() {
	// Get Keycloak variable from env variables
	url := os.Getenv("KEYCLOAK_URL")
	if url == "" {
		Logger.Panic("KEYCLOAK_URL is not set")
	}
	realm := os.Getenv("KEYCLOAK_REALM")
	if realm == "" {
		Logger.Panic("KEYCLOAK_REALM is not set")
	}
	clientId := os.Getenv("KEYCLOAK_CLIENT_ID")
	if clientId == "" {
		Logger.Panic("KEYCLOAK_CLIENT_ID is not set")
	}
	clientSecret := os.Getenv("KEYCLOAK_CLIENT_SECRET")
	if clientSecret == "" {
		Logger.Panic("KEYCLOAK_CLIENT_SECRET is not set")
	}

	GinKeycloakConfig = &ginkeycloak.KeycloakConfig{
		Url:         url,
		Realm:       realm,
		FullCertsPath: nil,
	}

	client := gocloak.NewClient(url)

	ClientKeycloakConfig = &KeycloakConfig{
		KeycloakURL: url,
		ClientID:    clientId,
		ClientSecret: clientSecret,
		Realm:       realm,
		Client:      client,
	}

	Logger.Info("Keycloak connection established")
}

func ServiceBrokerReady(url string) (bool, error) {
	// Send HTTP GET request to service broker
	resp, err := http.Get(url)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return false, nil
	}
	return true, nil
}

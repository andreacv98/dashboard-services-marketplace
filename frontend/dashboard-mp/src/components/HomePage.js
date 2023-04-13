import { Container } from "react-bootstrap";
import ServiceCard from "./ServiceCard";

function Home(props) {

    return (
        <>
        <Container className="m-3">
            <h1 className="text-center">Catalog</h1>
            <Container>
                <ServiceCard
                    serviceTitle="Example Service Title"
                    serviceDescription="This is a description of a cloud service offered by a third party cloud service provider"
                    serviceTags="tag1, tag2, tag3"
                />
            </Container>
        </Container>            
        </>
    )
}

export default Home;
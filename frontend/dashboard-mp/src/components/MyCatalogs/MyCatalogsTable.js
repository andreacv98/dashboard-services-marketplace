import { Table } from 'react-bootstrap';
import MyCatalogRow from './MyCatalogRow';

function SubscribedServicesTable(props) {
    const myCatalogs = props.myCatalogs;
    const isLoading = props.isLoading;
    const setIsLoading = props.setIsLoading;
    const error = props.error;
    const setError = props.setError;

    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Catalog Name</th>
                    <th>URL</th>
                    <th>Reachable</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
                {myCatalogs.map((myCatalog) => (
                    <MyCatalogRow
                        key={myCatalog.id}
                        id={myCatalog.id}
                        name={myCatalog.name}
                        description={myCatalog.description}
                        url={myCatalog.url}
                        createdAt={myCatalog.created_at}
                    />
                ))}
            </tbody>
        </Table>
    )

}

export default SubscribedServicesTable;
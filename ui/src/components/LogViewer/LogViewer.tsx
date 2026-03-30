import type { ColumnType } from "antd/es/table";
import Table from "antd/es/table";

interface LogViewerProps { 
    // TODO: implement props 
    columns: ColumnType<any>[];
    data: any[];
};

export const LogViewer = ({ columns, data }: LogViewerProps) => { 
    return (
        <>
          <Table 
            columns={columns} 
            dataSource={data} 
            rowKey={"id"}
          />
        </>
    );
}
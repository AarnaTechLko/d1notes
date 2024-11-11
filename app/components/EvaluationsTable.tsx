import React from 'react';
import { useTable, Column } from 'react-table';

interface Evaluation {
  id: number;
  review_title: string;
  primary_video_link: string;
  video_link_two?: string;
  video_link_three?: string;
  video_description?: string;
  evaluation_status: string;
  payment_status: string;
  created_at: string;
}

interface EvaluationsTableProps {
  data: Evaluation[];
}

const EvaluationsTable: React.FC<EvaluationsTableProps> = ({ data }) => {
  const columns: Column<Evaluation>[] = React.useMemo(
    () => [
      { Header: 'Review Title', accessor: 'review_title' },
      { Header: 'Primary Video Link', accessor: 'primary_video_link' },
      { Header: 'Video Link Two', accessor: 'video_link_two' },
      { Header: 'Video Link Three', accessor: 'video_link_three' },
      { Header: 'Video Description', accessor: 'video_description' },
      { Header: 'Evaluation Status', accessor: 'evaluation_status' },
      { Header: 'Payment Status', accessor: 'payment_status' },
      { Header: 'Created At', accessor: 'created_at' },
    ],
    [] // Empty dependency array means it will only run once on mount
  );

  // Call useTable unconditionally
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable<Evaluation>({ columns, data });

  // Check if data is an array and has elements after defining hooks
  if (!Array.isArray(data) || data.length === 0) {
    return <div>No evaluations available.</div>;
  }

  return (
    <table {...getTableProps()} className="min-w-full border-collapse border border-gray-300">
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
            {headerGroup.headers.map(column => (
              <th
                {...column.getHeaderProps()}
                key={column.id}
                className="border border-gray-300 p-2 bg-gray-200"
              >
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row);
          const { key, ...rowProps } = row.getRowProps();
          return (
            <tr {...rowProps} key={row.id}>
              {row.cells.map((cell, index) => {
                const { key, ...cellProps } = cell.getCellProps();
                return (
                  <td key={`${row.id}-${index}`} {...cellProps} className="border border-gray-300 p-2">
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default EvaluationsTable;

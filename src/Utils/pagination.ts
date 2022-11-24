interface IPaginateProps {
    count: {
        totalItems: number;
    };
    limit: number;
    page: number;
}

interface IPaginateReturn {
    totalPages: number;
    hasNextPage: boolean;
    page: number;
}

const paginate = (props: IPaginateProps) : IPaginateReturn => {
    let { count, page, limit } = props;
    const totalPages = Math.ceil(count.totalItems / limit);
    
    const hasNextPage = page < totalPages;

    return {
        totalPages,
        hasNextPage,
        page
    }
};

export {paginate};
interface IPaginateProps {
    totalItemsCount: number;
    limit: number;
    page: number;
}

interface IPaginateReturn {
    totalPages: number;
    hasNextPage: boolean;
    page: number;
}

const paginate = (props: IPaginateProps) : IPaginateReturn => {
    let { totalItemsCount, page, limit } = props;
    const totalPages = Math.ceil(totalItemsCount / limit);
    const hasNextPage = page < totalPages;

    return {
        totalPages,
        hasNextPage,
        page
    }
};

export {paginate};
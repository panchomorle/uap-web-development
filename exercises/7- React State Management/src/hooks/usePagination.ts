import { useAtom } from "jotai";
import { pageAtom, pageLimitAtom } from "../stores/paginationStore";

export const usePagination = () => {
    const [currentPage, setCurrentPage] = useAtom(pageAtom);
    const [pageLimit, setPageLimit] = useAtom(pageLimitAtom);
    
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = (totalPages: number) => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPage = (page: number) => {
        if (page > 0 && page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const changePageLimit = (limit: number) => {
        if (limit > 0) {
            setPageLimit(limit);
            // Reset to the first page when changing the limit
            setCurrentPage(1);
        }
    };

    return {
        currentPage,
        pageLimit,
        goToNextPage,
        goToPreviousPage,
        goToPage,
        changePageLimit
    };
};
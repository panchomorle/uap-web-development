import { useAtom } from "jotai";
import { useToast } from "./useToast";
import { usePagination } from "./usePagination";
import { currentFilterAtom } from "../stores/filterStore";
import { FILTER_TRANSLATION } from "../constants/constants";
import type { Filter } from "../types";

export const useFilter = () => {
    const toast = useToast();
    const { goToPage } = usePagination();
    const [filter, setFilter] = useAtom(currentFilterAtom);
    
    const changeFilter = (filter: Filter) => {
        setFilter(filter);
        goToPage(1); // Reset to the first page when changing the filter
        toast.success(`✅ Filtro cambiado a "${FILTER_TRANSLATION[filter]}"`);
    }

    return {
        filter,
        changeFilter
    };
};
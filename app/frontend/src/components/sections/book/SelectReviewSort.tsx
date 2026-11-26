import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/UI/Select";
import { cn } from "@/lib/utils";
import { selectTriggerClass } from "@/components/UI/form/field.styles";
import { SelectReviewSortProps, SORT_OPTIONS } from "@/types/types";

export default function SelectReviewSort({
    value,
    onChange,
    disabled,
}: SelectReviewSortProps) {
    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className={cn(selectTriggerClass, "w-44")}>
                <SelectValue placeholder="Choisir un tri" />
            </SelectTrigger>
            <SelectContent animate={true}>
                {SORT_OPTIONS.map((option, index) => (
                    <SelectItem
                        key={option.value}
                        value={option.value}
                        animate={true}
                        index={index}
                    >
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

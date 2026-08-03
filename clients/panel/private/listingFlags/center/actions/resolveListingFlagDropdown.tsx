import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {CircleCheck} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ListingFlag} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingFlag/listingFlag.dto.ts";

type Props = WithLanguageType & {
    listingFlag: ListingFlag;
    onAction: (action: string) => void;
};

function ResolveListingFlagDropdown({listingFlag, onAction, resolveLanguageKey}: Props) {
    const {write} = useAccess("listingflags");
    const canShow = !!write && !listingFlag.deletedAt && listingFlag.status === "pending";

    if (!canShow) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => onAction("resolve")}>
            <CircleCheck size={16} className="text-success" />
            <span>{resolveLanguageKey("title")}</span>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/listingFlags/center/actions/resolveListingFlagDropdown.tsx"),
    withDebug(true, true),
)(ResolveListingFlagDropdown);

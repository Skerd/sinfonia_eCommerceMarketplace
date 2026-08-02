import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {CircleX} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Dispute} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/dispute/dispute.dto.ts";

type Props = WithLanguageType & {
    dispute: Dispute;
    onAction: (action: string) => void;
};

function CloseDisputeDropdown({dispute, onAction, resolveLanguageKey}: Props) {
    const {write} = useAccess("disputes");

    const openish = dispute.status === "open" || dispute.status === "under_review";
    const canShow = !!write && !dispute.deletedAt && openish;

    if (!canShow) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => onAction("close")}>
            <CircleX size={16} className="text-red-600" />
            <span className="">{resolveLanguageKey("title")}</span>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/disputes/center/actions/closeDisputeDropdown.tsx"),
    withDebug(true, true),
)(CloseDisputeDropdown);

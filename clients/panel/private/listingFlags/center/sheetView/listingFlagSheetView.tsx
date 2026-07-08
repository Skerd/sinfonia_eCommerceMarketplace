import { compose } from "redux";
import { useEffect, useState } from "react";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import { useAccess } from "@coreModule/helpers/hocs/withAccess.tsx";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import { useViewConfig } from "@coreModule/helpers/hooks/useViewConfig.ts";
import type { ListingFlag } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingFlag/listingFlag.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";

type ListingFlagSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    listingFlag?: ListingFlag;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function ListingFlagSheetView({
    open, onOpenChange, listingFlag: flagProp,
    resolveLanguageKey, hideActions = false,
    onDelete = () => {}, onRestore = () => {}, fetchId,
}: ListingFlagSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(flagProp || { _id: fetchId });
    const access = useAccess("listingflags");
    const viewConfig = useViewConfig("listingflags", "sheet");

    useEffect(() => { if (!flagProp) return; setSheetData(flagProp as any); }, [flagProp]);

    const entityId = flagProp?._id ?? fetchId;

    const editPath = (() => {
        if (!entityId) return "";
        const params = new URLSearchParams();
        params.set("listingFlagId", entityId);
        return `/eCommerce/listingflags/edit?${params.toString()}`;
    })();

    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig} data={sheetData} open={open} onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey} access={access} hideActions={hideActions}
            onDelete={onDelete} onRestore={onRestore} editPath={editPath}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/listingFlags/center/sheetView/listingFlagSheetView.tsx"),
    withDebug(true, true),
)(ListingFlagSheetView);

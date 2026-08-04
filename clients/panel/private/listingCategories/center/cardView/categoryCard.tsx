import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {ListingCategory} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingCategory/listingCategory.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconCategory2, IconHash, IconTag} from "@tabler/icons-react";
import ListingCategorySheetView from "@eCommerceMarketplaceModule/clients/panel/private/listingCategories/center/sheetView/categorySheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

const LIST_BASE = "/tenancy/systemSettings/listingcategories";

function categoryEditPath(category: ListingCategory) {
    const params = new URLSearchParams();
    params.set("categoryId", category._id);
    if (category.name) params.set("categoryName", category.name);
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type ListingCategoryCardProps = WithLanguageType & {
    category: ListingCategory;
    onDelete?: (deleted?: ListingCategory, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function ListingCategoryCard({
    category: categoryProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: ListingCategoryCardProps) {
    const {action, setAction, entity: category, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: categoryProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("listingcategories");


    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && category.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    return (
        <>
            {!sheetOnly && (
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={category.deletedAt} deletedBy={category.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                title={category.name ?? <ValueNotSet />}
                                showTitle={!!read?.name}
                                badges={undefined}
                                showBadges={false}
                                hideActions={hideActions}
                                actionMenu={
                                    undefined
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <div className="flex flex-col gap-y-1">
                                    <InfoRowGroup>
<InfoRow
                                        label={resolveLanguageKey("slug")}
                                        icon={IconTag}
                                        show={!!read?.slug}
                                        value={category.slug}
                                    />
                                </InfoRowGroup>
                                    <InfoRow
                                        label={resolveLanguageKey("parentListingCategory")}
                                        icon={IconCategory2}
                                        show={!!read?.parentListingCategory}
                                        value={category.parentListingCategory?.name}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("order")}
                                        icon={IconHash}
                                        show={!!read?.order}
                                        value={category.order != null ? String(category.order) : undefined}
                                    />
                            </div>
                        </div>
                        </div>
                    </div>
                </EntityCardShell>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <ListingCategorySheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            category={category}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"listingcategories"}
                            deleteId={category._id}
                            openAlert={action === "delete"}
                            name={read?.name && category.name}
                            confirmName={read?.name && category.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerceMarketplace/listingCategory"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"listingcategories"}
                            deleteId={category._id}
                            openAlert={action === "restore"}
                            name={read?.name && category.name}
                            confirmName={read?.name && category.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerceMarketplace/listingCategory/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/listingCategories/center/cardView/categoryCard.tsx"),
    withDebug(true, true),
)(ListingCategoryCard);

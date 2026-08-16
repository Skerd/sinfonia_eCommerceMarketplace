import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {ListingCategory} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingCategory/listingCategory.dto.ts";
import {IconCategory2, IconHash, IconTag} from "@tabler/icons-react";
import ListingCategorySheetView from "@eCommerceMarketplaceModule/clients/panel/private/listingCategories/center/sheetView/categorySheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const LIST_BASE = "/tenancy/systemSettings/listingcategories";

function categoryEditPath(category: ListingCategory) {
    const params = new URLSearchParams();
    params.set("categoryId", category._id);
    if (category.name) params.set("categoryName", category.name);
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type ListingCategoryCardProps = WithLanguageType & {
    category: ListingCategory;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ListingCategory, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ListingCategory> | null>;
};

function ListingCategoryCard({
    category,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: ListingCategoryCardProps) {
    return (
        <EntityCard
            resource="listingcategories"
            entity={category}
            fetchId={fetchId}
            singleUrl="/api/eCommerceMarketplace/listingCategory/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={categoryEditPath}
            Sheet={ListingCategorySheetView}
            sheetEntityProp="category"
            deleteUrl="/api/eCommerceMarketplace/listingCategory"
            restoreUrl="/api/eCommerceMarketplace/listingCategory/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity}) => (
                <>
                    <EntityCard.Header titlePath="name" title={entity.name} />
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconTag}
                            label={resolveLanguageKey("slug")}
                            tooltip={resolveLanguageKey("slug")}
                            path="slug"
                            value={entity.slug}
                        />
                        <DisplayRow
                            icon={IconCategory2}
                            label={resolveLanguageKey("parentListingCategory")}
                            tooltip={resolveLanguageKey("parentListingCategory")}
                            path="parentListingCategory.name"
                            value={entity.parentListingCategory?.name}
                        />
                        <DisplayRow
                            icon={IconHash}
                            label={resolveLanguageKey("order")}
                            tooltip={resolveLanguageKey("order")}
                            path="order"
                            type="number"
                            value={entity.order}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/listingCategories/center/cardView/categoryCard.tsx"),
    withDebug(true, true),
)(ListingCategoryCard);

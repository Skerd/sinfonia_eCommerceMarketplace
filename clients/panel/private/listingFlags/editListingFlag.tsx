import { Save } from "lucide-react";
import { createGenericEditPage } from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import { updateListingFlagFormSchema } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingFlag/updateListingFlag.form.validator.ts";
import type { ListingFlag } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingFlag/listingFlag.dto.ts";
import type { UpdateListingFlagFormType } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingFlag/listingFlag.schema-def.ts";

export default createGenericEditPage<ListingFlag, UpdateListingFlagFormType>({
    languagePath: "src/modules/eCommerceMarketplace/clients/panel/private/listingFlags/editListingFlag.tsx",
    collectionName: "listingflags",
    accessModel: "listingflags",
    apiUrl: "/api/eCommerceMarketplace/listingFlag",
    schema: updateListingFlagFormSchema,
    buildInitialValues: (data, writeFields) => ({
        _id: data._id,
        reason: writeFields.reason ? data.reason : undefined,
        comment: writeFields.comment ? (data.comment ?? "") : undefined,
    }),
    submitIcon: <Save />,
});

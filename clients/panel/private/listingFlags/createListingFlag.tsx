import { IconPlus } from "@tabler/icons-react";
import { createGenericCreatePage } from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import { createListingFlagFormSchema } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingFlag/createListingFlag.form.validator.ts";
import type { CreateListingFlagFormType } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingFlag/listingFlag.schema-def.ts";

export default createGenericCreatePage<CreateListingFlagFormType>({
    languagePath: "src/modules/eCommerceMarketplace/clients/panel/private/listingFlags/createListingFlag.tsx",
    collectionName: "listingflags",
    accessModel: "listingflags",
    apiUrl: "/api/eCommerceMarketplace/listingFlag",
    schema: createListingFlagFormSchema,
    defaultValues: { listingId: "", reason: "other", comment: "" },
    submitIcon: <IconPlus />,
});

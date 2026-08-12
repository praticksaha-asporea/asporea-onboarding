const MOCK_CATEGORIES = [
    { _id: "cat-career", title: "Mobility - Career Pathway " },
    { _id: "cat-country", title: "Mobility - Country Pathway " },
    { _id: "cat-language", title: "Mobility – Language & Cultural Training Pathway" },
    { _id: "cat-skill", title: "Skill Development Pathway" },
    // { _id: "cat-global", title: "Global Learning Program" },
    { _id: "cat-other", title: "Other Services" },
];

// Keyed by category _id — shape matches what the real /pathways/:id/positions
// endpoint should return: { grouped: false, positions: [...] } OR { grouped: true, groups: [...] }
const MOCK_POSITIONS: Record<string, any> = {
    "cat-career": {
        grouped: false,
        positions: [
            { _id: "pos-retail-lulu", title: "Retail Pathway to Lulu Hypermarket" },
            { _id: "pos-retail-landmark", title: "Retail Pathway to Landmark Group" },
            { _id: "pos-hospitality-malta", title: "Hospitality Pathway to Malta" },
            { _id: "pos-nursing-germany", title: "Nursing Pathway to Germany" },
            { _id: "pos-ausbildung-germany", title: "Ausbildung in Germany" },
            { _id: "pos-nursing-qatar", title: "Nursing Pathway to Qatar" },
            { _id: "pos-caregiver-israel", title: "Caregiver Pathway to Israel" },
            { _id: "pos-nursing-singapore", title: "Nursing Pathway to Singapore" },
            { _id: "pos-caregiver-singapore", title: "Caregiver Pathway to Singapore" },
            { _id: "pos-fdw-singapore", title: "FDW Pathway to Singapore" },
            { _id: "pos-automotive-stellantis", title: "Automotive Pathway to Stellantis Group" },
            { _id: "pos-warehouse-poland", title: "Warehouse Pathway to Poland" },
            { _id: "pos-alabugga-russia", title: "Alabugga Start Pathway to Russia" },
            { _id: "pos-ssw-automotive-japan", title: "SSW Automotive Pathway to Japan" },
            { _id: "pos-ssw-driver-japan", title: "SSW Driver Pathway to Japan" },
            { _id: "pos-ssw-agriculture-japan", title: "SSW Agriculture Pathway to Japan" },
            { _id: "pos-ssw-construction-japan", title: "SSW Construction Pathway to Japan" },
            { _id: "pos-ssw-nursing-japan", title: "SSW Nursing Care Pathway to Japan" },
            { _id: "pos-ssw-hospitality-japan", title: "SSW Hospitality Pathway to Japan" },
            { _id: "pos-ssw-cleaning-japan", title: "SSW Building Cleaning Pathway to Japan" },
        ],
    },

    "cat-country": {
        grouped: true,
        groups: [
            { subgroup: "Malta", positions: [{ _id: "pos-c-malta-hospitality", title: "Hospitality Pathway to Malta" }] },
            {
                subgroup: "Germany",
                positions: [
                    { _id: "pos-c-germany-nursing", title: "Nursing Pathway to Germany" },
                    { _id: "pos-c-germany-ausbildung", title: "Ausbildung in Germany" },
                ],
            },
            { subgroup: "Slovakia", positions: [{ _id: "pos-c-slovakia-automotive", title: "Automotive Pathway to Stellantis Group" }] },
            { subgroup: "Serbia", positions: [{ _id: "pos-c-serbia-automotive", title: "Automotive Pathway to Stellantis Group" }] },
            { subgroup: "Poland", positions: [{ _id: "pos-c-poland-warehouse", title: "Warehouse Pathway to Poland" }] },
            {
                subgroup: "Singapore",
                positions: [
                    { _id: "pos-c-sg-nursing", title: "Nursing Pathway to Singapore" },
                    { _id: "pos-c-sg-caregiver", title: "Caregiver Pathway to Singapore" },
                    { _id: "pos-c-sg-fdw", title: "FDW Pathway to Singapore" },
                ],
            },
            { subgroup: "Israel", positions: [{ _id: "pos-c-israel-caregiver", title: "Caregiver Pathway to Israel" }] },
            { subgroup: "Qatar", positions: [{ _id: "pos-c-qatar-nursing", title: "Nursing Pathway to Qatar" }] },
            { subgroup: "UAE", positions: [{ _id: "pos-c-uae-retail", title: "Retail Pathway to UAE" }] },
            { subgroup: "Russia", positions: [{ _id: "pos-c-russia-alabugga", title: "Alabugga Start Pathway to Russia" }] },
            {
                subgroup: "Japan",
                positions: [
                    { _id: "pos-c-jp-automotive", title: "SSW Automotive Pathway to Japan" },
                    { _id: "pos-c-jp-driver", title: "SSW Driver Pathway to Japan" },
                    { _id: "pos-c-jp-agriculture", title: "SSW Agriculture Pathway to Japan" },
                    { _id: "pos-c-jp-construction", title: "SSW Construction Pathway to Japan" },
                    { _id: "pos-c-jp-nursing", title: "SSW Nursing Care Pathway to Japan" },
                    { _id: "pos-c-jp-hospitality", title: "SSW Hospitality Pathway to Japan" },
                    { _id: "pos-c-jp-cleaning", title: "SSW Building Cleaning Pathway to Japan" },
                ],
            },
        ],
    },

    "cat-language": {
        grouped: true,
        groups: [
            {
                subgroup: "German Language – Germany",
                positions: [
                    { _id: "pos-l-de-nursing", title: "Nursing Pathway to Germany" },
                    { _id: "pos-l-de-ausbildung", title: "Ausbildung in Germany" },
                ],
            },
            {
                subgroup: "Japanese Language – Japan",
                positions: [
                    { _id: "pos-l-jp-automotive", title: "SSW Automotive Pathway to Japan" },
                    { _id: "pos-l-jp-driver", title: "SSW Driver Pathway to Japan" },
                    { _id: "pos-l-jp-agriculture", title: "SSW Agriculture Pathway to Japan" },
                    { _id: "pos-l-jp-construction", title: "SSW Construction Pathway to Japan" },
                    { _id: "pos-l-jp-nursing", title: "SSW Nursing Care Pathway to Japan" },
                    { _id: "pos-l-jp-hospitality", title: "SSW Hospitality Pathway to Japan" },
                    { _id: "pos-l-jp-cleaning", title: "SSW Building Cleaning Pathway to Japan" },
                ],
            },
            { subgroup: "Hebrew Language – Israel", positions: [{ _id: "pos-l-he-caregiver", title: "Caregiver Pathway to Israel" }] },
            { subgroup: "Russian Language – Russia", positions: [{ _id: "pos-l-ru-alabugga", title: "Alabugga Start Pathway to Russia" }] },
        ],
    },

    "cat-skill": {
        grouped: true,
        groups: [
            { subgroup: "PDC & Skill Pass – Malta", positions: [{ _id: "pos-s-malta-hospitality", title: "Hospitality Pathway to Malta" }] },
            {
                subgroup: "SSW – Japan",
                positions: [
                    { _id: "pos-s-jp-automotive", title: "Automotive Pathway to Japan" },
                    { _id: "pos-s-jp-driver", title: "Driver Pathway to Japan" },
                    { _id: "pos-s-jp-agriculture", title: "Agriculture Pathway to Japan" },
                    { _id: "pos-s-jp-construction", title: "Construction Pathway to Japan" },
                    { _id: "pos-s-jp-nursing", title: "Nursing Care Pathway to Japan" },
                    { _id: "pos-s-jp-hospitality", title: "Hospitality Pathway to Japan" },
                    { _id: "pos-s-jp-cleaning", title: "Building Cleaning Pathway to Japan" },
                ],
            },
            { subgroup: "Retail – Lulu Hypermarket Middle East", positions: [{ _id: "pos-s-retail-uae", title: "Retail Pathway to UAE" }] },
            {
                subgroup: "Automotive Assembly – Europe",
                positions: [
                    { _id: "pos-s-serbia-auto", title: "Serbia - Automotive Pathway to Stellantis Group" },
                    { _id: "pos-s-slovakia-auto", title: "Slovakia - Automotive Pathway to Stellantis Group" },
                ],
            },
            {
                subgroup: "Forklift Operation – Europe",
                positions: [
                    { _id: "pos-s-serbia-forklift", title: "Serbia - Forklift Pathway to Stellantis Group" },
                    { _id: "pos-s-slovakia-forklift", title: "Slovakia - Forklift Pathway to Stellantis Group" },
                ],
            },
            { subgroup: "Warehouse Operation", positions: [{ _id: "pos-s-poland-warehouse", title: "Warehouse Pathway to Poland" }] },
            {
                subgroup: "Caregiver",
                positions: [
                    { _id: "pos-s-israel-caregiver", title: "Caregiver Pathway to Israel" },
                    { _id: "pos-s-sg-caregiver", title: "Caregiver Pathway to Singapore" },
                    { _id: "pos-s-sg-fdw", title: "FDW Pathway to Singapore" },
                ],
            },
            { subgroup: "Nursing", positions: [{ _id: "pos-s-qatar-nursing", title: "Prometric – Nursing Pathway to Qatar" }] },
        ],
    },

    // "cat-global": {
    //     grouped: false,
    //     positions: [{ _id: "pos-global-soon", title: "Coming soon" }],
    // },

    "cat-other": {
        grouped: false,
        positions: [{ _id: "pos-other", title: "Other Services" }],
    },
};

// ─── Actions (mocked; swap body for real axios call once backend is ready) ─

export const getPathwayTopLevelAction = async () => {
    // TODO: replace with real call once backend is ready:
    // return axiosInstance.get("/pathways/top-level");

    await new Promise((r) => setTimeout(r, 300)); // simulate latency
    return { data: { success: true, data: MOCK_CATEGORIES } };
};

export const getPathwayPositionsAction = async ({ pathwayId }: { pathwayId: string }) => {
    // TODO: replace with real call once backend is ready:
    // return axiosInstance.get(`/pathways/${pathwayId}/positions`);

    await new Promise((r) => setTimeout(r, 300));
    const data = MOCK_POSITIONS[pathwayId] || { grouped: false, positions: [] };
    return { data: { success: true, data } };
};
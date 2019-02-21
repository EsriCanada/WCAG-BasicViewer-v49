define({
    root: ({
        search: "Search: ",
        searchPlaceholder: "Find address or place",
        searchEnterCriteria: "Enter search term for",
        pressAlt: "Press ALT + digit keys for fast navigation",
        instructions: "instructions",
        moreHelp: "More Help",
        wcagViewer: "Accessible Viewer",
        leftCollapse: "Collapse Left Panel",
        leftExpand: "Expand Left Panel",
        moreHelp: "More Help",
        totalCount: "Total Count: {0}",
        contactUs: "Contact Us",
        EsriWorldGeocoder: "Esri World Geocoder",
        language: {
            aria: {
                changeLanguage: "Change the language to ",
                currentLanguage: "Current language is ",
            },
            language: "Language: ",
            changeHere: "Change the language here.",
            flag: "_ Flag"
        },
        tooltips: {
            "home": "Default Extent",
            "locate": "Find my Location",
            "features": "Feature List",
            "filter": "Filters",
            "infoPanel": "Info Panel",
            "geoCoding": "Reverse Geocode",
            "instructions": "Instructions",
            "legend": "Legend",
            "bookmarks": "Bookmarks",
            "layerManager": "Layer Manager",
            "layers": "Layers",
            "basemap": "Basemap Gallery",
            "overview": "Overview map",
            "measure": "Measure",
            "edit": "Edit",
            "time": "Time",
            "print": "Print",
            "details": "Details",
            "directions": "Directions",
            "share": "Share",
            "vsplitter": "Click and drag or focus and use left/right arrows to resize. \nDouble-click or type Enter for optimal size."
        },
        badgesTips: {
            "reverseLocation": "Showing Location",
            "directions": "Showing Itinerary",
            "featureSelected": "Feature Selected",
            "someFilters": "Some Filters Apply",
            "searchResultInfo": "Shows Search Result Info",
            "followTheMap": "Follow The Map Mode",
        },
        overview: {
            mapExtent: "Map Extent",
            instructions: "Drag to change the Map Extent,\nor focus and use Arrow keys.",
        },
        TOC: {
            visibleAtScale: "Visible at Scale",
            notVisibleAtScale: "Not Visible at Scale",
            openFeatureTable: "Open Feature Table",
            closeFeatureTable: "Close Feature Table",
        },
        FilterTab: {
            attribute: "Attribute:",
            add: "Add",
            remove: "Remove",
            apply: "Apply",
            ignore: "Ignore",
        },
        FilterItem: {
            remove: "Remove",
            equal: "Equal",
            notEqual: "Not Equal",
            like: "Like",
            notLike: "Not Like",
            in: "In",
            notIn: "Not In",
            lessThen: "Less Then",
            moreThen: "More Then",
            between: "Between",
            notBetween: "Not Between",
            selectCriteria: "Select criteria",
            enterValueToMatch: "Enter value to match",
            enterLastValue: "Enter last value",
            invalidNumber: "Invalid number format",
            enterDateToMatch: "Enter date",
            enterLastDate: "Enter last date",
            invalidDate: "Invalid date format",
            missingDate: "Date reqired",
            rangeErrorDate: "Out of range"
        },
        featureList: {
            panTo: "Pan To",
            zoomTo: "Zoom To",
            followLink: "Follow Link"
        },
        "popupInfo": {
            headerNavigation: "Header navigation panel",
            "footerNavigation": "Footer navigation panel",
            "Next": "Next",
            "Prev": "Previous",
            "Score": "Score:",
            "clickToSelect": "Click on map to select features",
            "current": "Current Feature",
            "total": "Total Features",
            "zoomTo": "Zoom to Feature",
            "map": "Skip to Map",
            "clear": "Clear Selection",
            "noFeatures": "Nothing to show",
            "noPreselectedFeature": "No feature pre-selected",
            "instructions": "Click the map to select features <br/>or <br/>" +
                "<a href='#' id='linkToMap'>Skip to Map</a> and:<br/>" +
                "<ul>" +
                "<li>move the map cursor with <myKey>arrows</myKey>,</li>" +
                "<li>fine move with <myKey>SHIFT</myKey><myKey>arrows</myKey>, </li>" +
                "<li>fast move with <myKey aria-label='Control'>CTRL</myKey><myKey>arrows</myKey>, or<br/><br/></li>" +
                "<li>scroll map up and down with <myKey aria-label='Page Up'>PgUp</myKey> and <myKey aria-label='Page Down'>PgDn</myKey>,</li>" +
                "<li>scroll map left and right with <myKey>SHIFT</myKey><myKey aria-label='Page Up'>PgUp</myKey> and <myKey>SHIFT</myKey><myKey aria-label='Page Down'>PgDn</myKey>, then<br/><br/></li>" +
                "<li>press <myKey>ENTER</myKey> to select at cursor, or</li>" +
                "<li>press <myKey>SHIFT</myKey><myKey>ENTER</myKey> to select around cursor,</li>" +
                "<li>press <myKey aria-label='Control'>CTRL</myKey><myKey>ENTER</myKey> to select all map extent,</li>" +
                "<li>press <myKey aria-label='Control'>CTRL</myKey><myKey>SHIFT</myKey><myKey>ENTER</myKey> to select inside or around the selected feature.</li>" +
                "</ul>" +
                "<myKey>SHIFT</myKey> and <myKey aria-label='Control'>CTRL</myKey> keys work as well with mouse click.<br/><br/>",
            "addressToLocation": "Address To Location",
            symbol: "Symbol",
            "resultOf": 'Result {0} of {1}'
        },
        "geoCoding": {
            "tooltips": "ToolTips",
            "hideTooltips": "No ToolTips",
            "showTooltips": "Show ToolTips",
            "zoomTo": "Zoom to Location",
            "noAddress": "No Point Address",
            "noAddressFound": "No Address Found at Point",
            "clear": "Clear Selection",
            "instructions": "Click the map to get location address <br/>or <br/>" +
                "<a href='#' id='linkToMap'>Skip to Map</a> and:<br/>" +
                "<ul>" +
                "<li>move map with <myKey>arrows</myKey>, or</li>" +
                "<li>move map cursor with <myKey>SHIFT</myKey> + <myKey>arrows</myKey>, then</li>" +
                "<li>press <myKey>ENTER</myKey> to select at cursor.</li>" +
                "</ul>",
            "locationToAddress": "Location To Address",
            "Location": "Location",
            Copy: "Copy",
            CopyToClipboard: "Copy to Clipboard",
            "Address": "Address:",
            "Block": "Block:",
            "BldgName": "Building Name:",
            "LevelName": "Level Name:",
            "Phone": "Phone:",
            "Side": "Side:",
            "StDir": "St. Dir/Type:",
            "Status": "Status:",
            "UnitName": "Unit:",
            "City": "City:",
            "CountryCode": "Country Code:",
            "District": "District:",
            "MetroArea": "Metro Area:",
            "Neighborhood": "Neighborhood:",
            "PlaceName": "Place Name:",
            "PostalCode": "Postal Code:",
            "Region": "Region:",
            "Sector": "Sector:",
            "Territory": "Territory:",
            "Type": "Type:",
            "Addr_type": "Addr Type:"
        },
        "addrType": {
            PointAddress: "Address",
            StreetName: "Street Name",
            StreetAddress: "Street Address",
            POI: "Point Of Interest",
            World: "World",
            Locality: "Locality",
            Neighborhood: "Neighborhood",
            City: "City",
            Zone: "Zone",
            Bank: "Bank",
            Park: "Park",
            Postal: "Postal Code",
            College: "College",
            School: "School",
            ShoppingCenter: "Shopping Center",
            BusinessFacility: "Business Facility",
            County: "County",
            GolfCourse: "Golf Course",
            Parking: "Parking"
        }

    }),
    "ar": 1,
    "cs": 1,
    "da": 1,
    "de": 1,
    "el": 1,
    "es": 1,
    "et": 1,
    "fi": 1,
    "fr": 1,
    "he": 1,
    "it": 1,
    "ja": 1,
    "ko": 1,
    "lt": 1,
    "lv": 1,
    "nl": 1,
    "nb": 1,
    "pl": 1,
    "pt-br": 1,
    "pt-pt": 1,
    "ro": 1,
    "ru": 1,
    "sv": 1,
    "tr": 1,
    "th": 1,
    "vi": 1,
    "zh-cn": 1
});
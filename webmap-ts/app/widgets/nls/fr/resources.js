define(
    ({
        search: "Recherche : ",
        searchPlaceholder: "Trouver une adresse ou un lieu",
        searchEnterCriteria: "Terme recherché pour",
        pressAlt: "Appuyer sur ALT + chiffre pour naviguer rapidement",
        instructions: "instructions.french",
        moreHelp: "Plus d'aide",
        wcagViewer: "Visualiseur Accessible",
        leftCollapse: "Réduire le panneau gauche",
        leftExpand: "Révéler le panneau gauche",
        moreHelp: "Plus d'aide",
        totalCount: "Le compte total : {0}",
        contactUs: "Contactez nous",
        EsriWorldGeocoder: "Géocodeur Mondial Esri",
        language: {
            aria: {
                changeLanguage: "Changer la langue en ",
                currentLanguage: "La langue actuelle est"
            },
            language: "Langue : ",
            changeHere: "Changer la langue ici.",
            flag: "Drapeau _"
        },
        tooltips: {
            "home": "Etendue par Défaut",
            "locate": "Rechercher mon Site",
            "legend": "Légende",
            "bookmarks": "Géosignets",
            "layerManager": "Gestionnaire de Couche",
            "layers": "Couches",
            "infoPanel": "Panneau d'information",
            "geoCoding": "Géocodage inversé",
            "instructions": "Mode d'emploi",
            "basemap": "Galerie des fonds de carte",
            "overview": "Vue Générale",
            "measure": "Mesurer",
            "edit": "Modifier",
            "time": "Heure",
            "print": "Imprimer",
            "details": "Détails",
            "directions": "Itinéraires",
            "share": "Partager",
            "filter": "Filtres",
            "features": "Liste de caractéristiques",
            "vsplitter": "Cliquer et déplacer avec la souris ou utiliser le flèches gauche droite quand cet outil est activé. \nDouble-cliquer ou presser ‘Entrer’ pour ajuster à la taille optimale."
        },
        badgesTips: {
            "reverseLocation": "Afficher l'adresse du lieu",
            "directions": "Montrer l'itinéraire",
            "featureSelected": "Caractéristique sélectionnée",
            "someFilters": "Appliqué quelques filtres",
            "searchResultInfo": "Montre Recherche Résultat",
            "followTheMap": "Mode Suivez la carte",
        },
        overview: {
            mapExtent: "Étendue de la carte",
            instructions: "Faites glisser pour modifier l'étendue de la carte, \nou mise au point et utiliser les touches fléchées.",
        },
        TOC: {
            visibleAtScale: "Visible à l'échelle",
            notVisibleAtScale: "Non visible à l'échelle",
            openFeatureTable: "Ouvrir la table des fonctionnalités",
            closeFeatureTable: "Fermer la table des fonctionnalités",
        },
        FilterTab: {
            attribute: "Attribut :",
            add: "Ajouter",
            apply: "Accepter",
            ignore: "Négliger",
        },
        FilterItem: {
            remove: "Supprimer",
            equal: "Égal",
            notEqual: "Different",
            like: "Comme",
            notLike: "Pas comme",
            in: "Dans",
            notIn: "Pas en",
            lessThen: "Moins que",
            moreThen: "Plus que",
            between: "Entre",
            notBetween: "Pas Entre",
            selectCriteria: "Choisir un critère",
            enterValueToMatch: "Entrer la valeur correspondante",
            enterLastValue: "Entrer la dernière valeur",
            invalidNumber: "Format de numéro non valide",
            enterDateToMatch: "Entrez la date pour correspondre",
            enterLastDate: "Entrez la dernière date",
            invalidDate: "Format de date invalide",
            missingDate: "Date requise",
            rangeErrorDate: "Hors limites"
        },
        featureList: ({
            panTo: "Centrer sur",
            zoomTo: "Magnifier sur",
            followLink: "Suivez le lien"
        }),
        popupInfo: ({
            "headerNavigation": "Panneau de navigation de pied de page",
            "footerNavigation": "Footer navigation panel",
            "Next": "Suivante",
            "Prev": "Précédente",
            "Score": "Marque :",
            "clickToSelect": "Cliquez sur la carte pour sélectionner des caractéristiques",
            "current": "Caractéristique actuelle",
            "total": "Le total du caractéristiques sélectionnées",
            "zoomTo": "Zoomer sur caractéristique",
            "map": "Aller à la carte",
            "clear": "Effacer la sélection",
            "noFeatures": "Rien à montrer",
            "noPreselectedFeature": "Aucune caractéristiques présélectionnée",

            "instructions": "Cliquez sur la carte pour sélectionner des caractéristiques, <br/>ou <br/>" +
                "<a href='#' onclick='dojo.byId(\"mapDiv\").focus();'>Aller à la carte</a> et:" +
                "<ul>" +
                "<li>déplacer la carte avec <myKey>flèches</myKey>, ou</li>" +
                "<li>déplacer le curseur de carte avec <myKey>MAJ</myKey> + <myKey>flèches</myKey>, puis</li>" +
                "<li>appuyez sur <myKey>Entrée</myKey> pour sélectionner au curseur,</li>" +
                "<li>appuyez <myKey>MAJ</myKey> + <myKey>Entrée</myKey> pour sélectionner au curseur (x 10),</li>" +
                "<li>appuyez <myKey aria-label='Contrôle'>CTRL</myKey> + <myKey>Entrée</myKey> pour sélectionner toute dans l'étendue de la carte,</li>" +
                "<li>appuyez <myKey aria-label='Contrôle'>CTRL</myKey> + <myKey>MAJ</myKey> + <myKey>Entrée</myKey> pour sélectionner l'intérieur de la caractéristique sélectionnée.</li>" +
                "</ul>" +
                "En sélectionnant l'étendue, commence le mode 'Suivre la Carte'.",
            "addressToLocation": "Adresse à l'emplacement",
            symbol: "Symbole",
            "resultOf": '{0} de {1}'
        }),

    })
);
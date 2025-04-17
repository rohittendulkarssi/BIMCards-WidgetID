import * as React from "react";
import {
	registerWidget,
	registerLink,
	registerUI,
	IContextProvider,
	enableLocalization,
	registerCustomWidgetTemplate,
} from "./uxp";
import { TitleBar, FilterPanel, WidgetWrapper } from "uxp/components";
import { IWDDesignModeProps } from "widget-designer/components";
import BundleConfig from "../bundle.json";

import "./styles.scss";
import "./fdd.scss";

import BIMAssetCardWidget from "./components/BIMAssetCard";
import AlarmCard from "./components/AlarmCard";
import AssetCard from "./components/AssetCard";
import IncidentCard from "./components/IncidentCard";
import LocationCard from "./components/LocationCard";
import WorkOrderCard from "./components/WorkOrderCard";
import BIMLocationCardWidget from "./components/BIMLocationCard";
import FaultyDetection from "./prod/FaultyDetection";
// import BIMAssetCardWidget from "./BIMAssetCard";

export interface IWidgetProps {
	uxpContext?: IContextProvider;
	instanceId?: string;
	designer?: IWDDesignModeProps;
	uiProps?: any;
}

// const BIMDynamicCardWidget: React.FunctionComponent<IWidgetProps> = (props) => {
//     return (
//         <WidgetWrapper>
//             <TitleBar title='BIMDynamicCard'>
//                 <FilterPanel>
//                 </FilterPanel>
//             </TitleBar>
//         </WidgetWrapper>
//     )
// };

/**
 * Register as a Widget
 */
registerWidget({
	id: "BIMAssetDynamicCard",
	widget: BIMAssetCardWidget,
	configs: {
		layout: {
			// w: 12,
			// h: 12,
			// minH: 12,
			// minW: 12
		},
		props: [
			{
				name: "AssetCard_SCDetails",
				label: "Asset Service Contract Details",
				type: "toggle",
			},
			{
				name: "AssetCard_WRDetails",
				label: "Asset Work Request Details",
				type: "toggle",
			},
		],
	},
});
registerWidget({
	id: "BIMLocationDynamicCard",
	widget: BIMLocationCardWidget,
	configs: {
		layout: {
			// w: 12,
			// h: 12,
			// minH: 12,
			// minW: 12
		},
		props: [
			{
				name: "LocationCard_IMDetails",
				label: "Location Incident Details",
				type: "toggle",
			},
		],
	},
});
registerWidget({
	id: "SBIMCard_AlarmCard",
	widget: AlarmCard,
	configs: {
		layout: {
			// w: 12,
			// h: 12,
			// minH: 12,
			// minW: 12
		},
	},
});
registerWidget({
	id: "SBIMCard_AssetCard",
	widget: AssetCard,
	configs: {
		layout: {
			// w: 12,
			// h: 12,
			// minH: 12,
			// minW: 12
		},
	},
});
registerWidget({
	id: "SBIMCard_IncidentCard",
	widget: IncidentCard,
	configs: {
		layout: {
			// w: 12,
			// h: 12,
			// minH: 12,
			// minW: 12
		},
	},
});
registerWidget({
	id: "SBIMCard_LocationCard",
	widget: LocationCard,
	configs: {
		layout: {
			// w: 12,
			// h: 12,
			// minH: 12,
			// minW: 12
		},
	},
});
registerWidget({
	id: "SBIMCard_WorkOrderCard",
	widget: WorkOrderCard,
	configs: {
		layout: {
			// w: 12,
			// h: 12,
			// minH: 12,
			// minW: 12
		},
	},
});
// registerWidget({
// 	id: "SBIMCard_FDDWidget",
// 	widget: FaultyDetection,
// 	configs: {
// 		layout: {
// 			// w: 12,
// 			// h: 12,
// 			// minH: 12,
// 			// minW: 12
// 		},
// 	},
// });

/**
 * Register as a Sidebar Link
 */
/*
registerLink({
    id: "BIMDynamicCard",
    label: "BIMDynamicCard",
    // click: () => alert("Hello"),
    component: BIMDynamicCardWidget
});
*/

/**
 * Register as a UI
 */

/*
registerUI({
   id:"BIMDynamicCard",
   component: BIMDynamicCardWidget
});
*/

/**
 * Register as a Widget template
 * This will enable this widget to be edited through the designer
 */

/**
registerCustomWidgetTemplate({
    id: "BIMDynamicCard", // use all lowercase letters
    name: 'BIMDynamicCard',
    description: 'Tempalte Description',
    template: BIMDynamicCardWidget,
    moduleId: BundleConfig.id,
    complexity: 'advanced',
    icon: ['fas', 'list'],
    expectedSchema: 'dictionary-array'
});
*/

/**
 * Enable localization
 *
 * This will enable the localization
 *
 * you can use uxpContext.$L() function
 *
 * Ex: Assume you  have a localization message in localization json
 *
 * ```
 * // localization.json
 *
 * {
 *      "uxp.my-widget.title": {
 *          "en": "This is my widget" // english translation,
 *          "ar": "<arabic tranlation >",
 *          ... here goes other translations
 *      }
 * }
 *
 * ```
 *
 *
 * thne in your widget
 *
 * ```
 * // your widget
 *
 * return <WidgetWrapper>
 *      <div class='title'>
 *          {props.uxpContext.$L('uxp.my-widget.title')}
 *      </div>
 *  </WidgetWrapper>
 *
 * ```
 *
 * /// you can have parameters as well
 * // we use `$` mark to identify params
 * // Ex: $name, $location
 *
 * ```
 * // localization.json
 *
 * {
 *      ...
 *      "uxp.my-widget.user-welcom-msg":{
 *          "en": "$userName welcome to my widget"
 *      }
 * }
 * ```
 *
 * in widget
 *
 * ```
 *      ...
 *      <div> {props.uxpContext.$L('uxp.my-widget.user-welcom-msg', {userName: "Jane Doe"})} </div>
 * ```
 *
 *
 */

// enableLocalization()

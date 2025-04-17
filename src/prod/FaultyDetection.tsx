import * as React from "react";
import { IContextProvider } from "../uxp";
import {
	TitleBar,
	WidgetWrapper,
	useToast,
	Select,
	Loading,
	FilterPanel,
	FormField,
	DateRangePicker,
	HorizontalScrollList,
	SearchBox,
} from "uxp/components";
import { SelectSystemIcon, DWYTimeFilter } from "../common";
import FaultyDetectionTable from "./FaultyDetection/FaultyDetectionTable";
import "./FaultyDetection.scss";
import { endOfWeek, startOfWeek } from "date-fns";
import axios, { AxiosResponse } from "axios";

interface IProps {
	uxpContext?: IContextProvider;
}

const FaultyDetection: React.FunctionComponent<IProps> = (props) => {
	//const Base_Url = 'https://ssi.iviva.cloud';
	// const Base_Url = 'http://c2o.iviva.com';
	const Base_Url = window.location.origin;
	// const Base_Url = props.uxpContext?.lucyUrl;
	//const Base_Url = 'https://psrc.iviva.cloud';

	const [LocationList, setLocationList] = React.useState([]);
	const [LocationKey, setLocationKey] = React.useState(null);
	const [TimeOffset, setTimeOffset] = React.useState(null);
	const [CurrencyType, setCurrencyType] = React.useState(null);

	const [TimeFilterList, setTimeFilterList] = React.useState(DWYTimeFilter);
	const [TimeLimit, setTimeLimit] = React.useState("M");
	const [SystemList, setSystemList] = React.useState([]);
	const [SystemKey, setSystemKey] = React.useState("");
	const [FaultyDataSet, setFaultyDataSet] = React.useState([]);
	const [FilterFaultyDataSet, setFilterFaultyDataSet] = React.useState([]);
	const [LoadDataList, setLoadDataList] = React.useState(false);
	const [DateRange, setDateRange] = React.useState({
		StatDate: null,
		EndDate: null,
	});
	const [queryAssetID, setqueryAssetID] = React.useState("");

	React.useEffect(() => {
		GetLocations();
	}, []);

	async function GetLocations() {
		let execurl = `${Base_Url}/api/CMAT/Orphans/GetBuildings`;
		console.log(props.uxpContext, "url");
		axios
			.get(`${execurl}?apikey=${props.uxpContext?.apiKey}&LocationTypeKey=2`)
			.then((response) => {
				let res: any[] = response.data;

				var AllLocation = [
					{
						Currency: "",
						LocationID: "All",
						LocationKey: "0",
						LocationName: "All",
						TimeOffset: "0",
						TimeZone: "0",
					},
				];
				if (res) {
					res = AllLocation.concat(res);
				}

				setLocationList(res);
				let to = "";
				if (res.length > 0) {
					let urlSearchParams = new URLSearchParams(window.location.search);
					let urllk = "";
					if (urlSearchParams.has("key")) {
						urllk = urlSearchParams.get("key");
						var lk_status = res.some((post) => post.LocationKey == urllk);
						var lk_details = res.find((post) => post.LocationKey == urllk);
						if (lk_status == true) {
							// setLocationKey(urllk);
							setTimeOffset(lk_details ? lk_details.TimeOffset : null);
							setLocationKey(lk_details ? lk_details.LocationKey : null);
							setCurrencyType(lk_details ? lk_details.Currency : null);
							to = lk_details ? lk_details.TimeOffset : "0";
						} else {
							setLocationKey(res[0].LocationKey);
							setTimeOffset(res[0].TimeOffset);
							setCurrencyType(res[0].Currency);
							to = res[0].TimeOffset ? res[0].TimeOffset : "0";
						}
					} else {
						urllk = null;
						setTimeOffset(res.length > 0 ? res[1].TimeOffset : null);
						setLocationKey(res.length > 0 ? res[1].LocationKey : null);
						setCurrencyType(res.length > 0 ? res[1].Currency : null);
						to = res[1].TimeOffset ? res[1].TimeOffset : "0";
					}
				}
				// setTimeOffset(res.length>0 ? res[0].TimeOffset : null);
				// setLocationKey(res.length>0 ? res[0].LocationKey : null);
				// setCurrencyType(res.length>0 ? res[0].Currency : null);
				// let to = res.length>0 ? res[0].TimeOffset : '0';
				let nwdt = new Date();
				let nwdtlcl = new Date(
					nwdt.getTime() +
						(parseFloat(to.toString()) + nwdt.getTimezoneOffset()) * 60000
				);
				let nwdtlcls = new Date(
					nwdt.getTime() +
						(parseFloat(to.toString()) + nwdt.getTimezoneOffset()) * 60000
				);
				// var firstDay = new Date(nwdtlcl.getFullYear(), 0, 1);
				// var lastDay = new Date(nwdtlcl.getFullYear(), 12, 0);
				var firstDay = new Date(nwdtlcl.getFullYear(), nwdtlcl.getMonth(), 1);
				var lastDay = new Date(
					nwdtlcls.getFullYear(),
					nwdtlcls.getMonth() + 1,
					0
				);
				setDateRange({ StatDate: firstDay, EndDate: lastDay });
			})
			.catch((e) => {
				console.log("except: ", e);
				setLocationList([]);
				toast.error("Something went wrong");
			});
	}

	React.useEffect(() => {
		GetFaultySystemListFromDB();
	}, [LocationKey, DateRange]);

	React.useEffect(() => {
		GetFaultyAssetDetailsFromDB();
	}, [SystemKey]);

	async function FilteringAssetName() {
		let filterdata: any[] = [];
		filterdata = await filterdataarray(FaultyDataSet, "AssetID", queryAssetID);
		setFilterFaultyDataSet(filterdata);
	}
	React.useEffect(() => {
		FilteringAssetName();
	}, [queryAssetID]);

	async function filterdataarray(
		gotarr: any[],
		attribute: string,
		searchtext: string
	) {
		try {
			var fldata = gotarr;
			var filterArray = await fldata.map((item) => {
				let curAssetID = item[attribute].toLowerCase();
				let curQuery = searchtext.toLowerCase();
				var matches = curAssetID.indexOf(curQuery) >= 0 ? true : false;
				if (matches) {
					return item;
				}
			});
			filterArray = filterArray.filter(function (element) {
				return element !== undefined;
			});
			return filterArray;
		} catch (e) {
			console.error(e);
			return [];
		}
	}

	React.useEffect(() => {
		if (TimeOffset != null && TimeLimit != "O") {
			let nwdtx = new Date();
			let nwdtlclx = new Date(
				nwdtx.getTime() +
					(parseFloat(TimeOffset.toString()) + nwdtx.getTimezoneOffset()) *
						60000
			);
			var lastDaytmp = nwdtlclx;
			if (TimeLimit === "M") {
				var firstDay = new Date(nwdtlclx.getFullYear(), nwdtlclx.getMonth(), 1);
				var lastDay = new Date(
					lastDaytmp.getFullYear(),
					lastDaytmp.getMonth() + 1,
					0
				);
			} else if (TimeLimit === "Y") {
				var firstDay = new Date(nwdtlclx.getFullYear(), 0, 1);
				var lastDay = new Date(lastDaytmp.getFullYear(), 12, 0);
			} else if (TimeLimit === "D") {
				var firstDay = new Date(
					nwdtlclx.getFullYear(),
					nwdtlclx.getMonth(),
					nwdtlclx.getDate()
				);
				var lastDay = new Date(
					lastDaytmp.getFullYear(),
					lastDaytmp.getMonth(),
					lastDaytmp.getDate()
				);
			} else {
				var firstDay = startOfWeek(nwdtlclx);
				var lastDay = endOfWeek(lastDaytmp);
			}
			setDateRange({ StatDate: firstDay, EndDate: lastDay });
		}
	}, [TimeLimit]);

	function Notifywidth(headcount: string) {
		if (headcount.toString().length > 2) {
			var getnotifylength = (headcount.toString().length - 2) * 5 + 30;
			return `${getnotifylength.toString()}px`;
		} else {
			return "25px";
		}
	}

	function Notifyvisibility(headcount: string) {
		if (parseInt(headcount) > 0) {
			return "visible";
		} else {
			return "hidden";
		}
	}

	let toast = useToast();
	async function GetFaultySystemListFromDB() {
		setSystemKey(null);
		if (
			LocationKey != "" &&
			LocationKey != null &&
			DateRange.StatDate != null &&
			DateRange.EndDate != null
		) {
			let curprefix = new Date().getTimezoneOffset();
			let stdt = new Date(DateRange.StatDate.getTime() - curprefix * 60000);
			let endx = DateRange.EndDate.setHours(23, 59, 59, 999);
			let enddt = new Date(new Date(endx).getTime() - curprefix * 60000);

			//let appurl = 'CMAT/CMATFaultDetectionWidgetData';
			let appurl = "C2ODemo/C2ODemoOrphans";
			//let execurl = `${Base_Url}/api/${appurl}/FaultDetectionSystemsAPI`;
			// let execurl = `${Base_Url}/api/${appurl}/FaultDetectionSystems_CapitalandAPI`;
			let execurl = `${Base_Url}/api/${appurl}/FaultDetectionSystems_SimulationAPI`;
			let parm = `&LocationKey=${
				LocationKey == "0" ? "" : LocationKey
			}&StartDate=${stdt.toISOString()}&EndDate=${enddt.toISOString()}&TimeZoneIn=${TimeOffset}`;
			axios
				.get(`${execurl}?apikey=${props.uxpContext?.apiKey}${parm}`)
				.then((response) => {
					let res: any[] = response.data;
					setFaultyDataSet([]);
					setLoadDataList(false);
					let sKey = res.length > 0 ? res[0].SystemKey : "";
					setSystemKey(sKey);
					let headsystems = SelectSystemIcon(res);
					setSystemList(headsystems);
				})
				.catch((e) => {
					console.log("except: ", e);
					setSystemList([]);
					setSystemKey("");
					setFaultyDataSet([]);
					setLoadDataList(true);
					toast.error("Something went wrong");
				});
		}
	}
	async function GetFaultyAssetDetailsFromDB() {
		if (
			SystemKey != "" &&
			SystemKey != null &&
			LocationKey != null &&
			LocationKey != "" &&
			DateRange.StatDate != null &&
			DateRange.EndDate != null
		) {
			setLoadDataList(false);
			let curprefix = new Date().getTimezoneOffset();
			let stdt = new Date(DateRange.StatDate.getTime() - curprefix * 60000);
			let endx = DateRange.EndDate.setHours(23, 59, 59, 999);
			let enddt = new Date(new Date(endx).getTime() - curprefix * 60000);

			//let appurl = 'CMAT/CMATFaultDetectionWidgetData';
			let appurl = "C2ODemo/C2ODemoOrphans";
			let baseurlu = window.location.origin;
			// let baseurlu = "https://harman.ssi.iviva.cloud/";
			//let baseurlu = 'https://ssi.iviva.cloud';
			//let execurl = `${baseurlu}/api/${appurl}/FaultDetectionMoreDetailsAPI`;
			// let execurl = `${baseurlu}/api/${appurl}/FaultDetectionMoreDetails_CapitalandAPI`;
			let execurl = `${baseurlu}/api/${appurl}/FaultDetectionMoreDetails_SimulationAPI`;
			let parm = `&LocationKey=${
				LocationKey == "0" ? "" : LocationKey
			}&SystemKey=${SystemKey}&StartDate=${stdt.toISOString()}&EndDate=${enddt.toISOString()}&TimeZoneIn=${TimeOffset}`;
			axios
				.get(`${execurl}?apikey=${props.uxpContext?.apiKey}${parm}`)
				.then((response) => {
					let res: any[] = response.data;
					setFaultyDataSet(res);
					setLoadDataList(true);
				})
				.catch((e) => {
					console.log("except: ", e);
					setFaultyDataSet([]);
					//setLoading(false);
					toast.error("Something went wrong");
				});
		}
	}

	return (
		<WidgetWrapper className="FaultyDetectionWidgetContainer">
			<div className="FaultyDetectionWidget">
				<TitleBar
					title="Fault Detection and Impact Assessment"
					icon="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48IS0tIEZvbnQgQXdlc29tZSBQcm8gNS4xNS40IGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIC0tPjxwYXRoIGQ9Ik01MDEuMSAzOTUuN0wzODQgMjc4LjZjLTIzLjEtMjMuMS01Ny42LTI3LjYtODUuNC0xMy45TDE5MiAxNTguMVY5Nkw2NCAwIDAgNjRsOTYgMTI4aDYyLjFsMTA2LjYgMTA2LjZjLTEzLjYgMjcuOC05LjIgNjIuMyAxMy45IDg1LjRsMTE3LjEgMTE3LjFjMTQuNiAxNC42IDM4LjIgMTQuNiA1Mi43IDBsNTIuNy01Mi43YzE0LjUtMTQuNiAxNC41LTM4LjIgMC01Mi43ek0zMzEuNyAyMjVjMjguMyAwIDU0LjkgMTEgNzQuOSAzMWwxOS40IDE5LjRjMTUuOC02LjkgMzAuOC0xNi41IDQzLjgtMjkuNSAzNy4xLTM3LjEgNDkuNy04OS4zIDM3LjktMTM2LjctMi4yLTktMTMuNS0xMi4xLTIwLjEtNS41bC03NC40IDc0LjQtNjcuOS0xMS4zTDMzNCA5OC45bDc0LjQtNzQuNGM2LjYtNi42IDMuNC0xNy45LTUuNy0yMC4yLTQ3LjQtMTEuNy05OS42LjktMTM2LjYgMzcuOS0yOC41IDI4LjUtNDEuOSA2Ni4xLTQxLjIgMTAzLjZsODIuMSA4Mi4xYzguMS0xLjkgMTYuNS0yLjkgMjQuNy0yLjl6bS0xMDMuOSA4MmwtNTYuNy01Ni43TDE4LjcgNDAyLjhjLTI1IDI1LTI1IDY1LjUgMCA5MC41czY1LjUgMjUgOTAuNSAwbDEyMy42LTEyMy42Yy03LjYtMTkuOS05LjktNDEuNi01LTYyLjd6TTY0IDQ3MmMtMTMuMiAwLTI0LTEwLjgtMjQtMjQgMC0xMy4zIDEwLjctMjQgMjQtMjRzMjQgMTAuNyAyNCAyNGMwIDEzLjItMTAuNyAyNC0yNCAyNHoiLz48L3N2Zz4="
				>
					<table style={{ float: "right", position: "relative" }}>
						<tbody>
							<tr>
								<td style={{ width: "130px", paddingRight: "5px" }}>
									<div style={{ width: "130px" }}>
										<Select
											className={"Common-DWMTimeFilter"}
											selected={TimeLimit}
											options={TimeFilterList}
											labelField="label"
											valueField="value"
											onChange={(newValue, option) => {
												if (newValue != "O") {
													setTimeLimit(newValue);
												}
											}}
											showEndOfContent={false}
										/>
									</div>
								</td>
								<td style={{ width: "150px", paddingRight: "5px" }}>
									<div style={{ width: "150px" }}>
										<Select
											className={"faultywidget-locationfilter"}
											selected={LocationKey}
											options={LocationList}
											labelField="LocationID"
											valueField="LocationKey"
											onChange={(newValue, option) => {
												setTimeOffset(parseFloat(option.TimeOffset));
												setCurrencyType(option.Currency);
												setLocationKey(newValue);
											}}
											showEndOfContent={false}
										/>
									</div>
								</td>
								<td style={{ width: "50px", paddingRight: "5px" }}>
									<FilterPanel>
										<FormField className="no-padding mb-only">
											<DateRangePicker
												title=""
												startDate={DateRange.StatDate}
												endDate={DateRange.EndDate}
												closeOnSelect
												onChange={(stDate, endDate) => {
													setDateRange({ StatDate: stDate, EndDate: endDate });
													setTimeLimit("O");
												}}
											/>
										</FormField>
									</FilterPanel>
								</td>
							</tr>
						</tbody>
					</table>
				</TitleBar>
				<div className="faultydetection-ColumnDevide" style={{ width: "100%" }}>
					<div className="faultydetection-Column" style={{ width: "70%" }}>
						<div className="FaultyDetectionWidget-systemlist-container">
							<HorizontalScrollList
								className="faultdetection-horizontallist"
								items={SystemList}
								renderItem={(item) => {
									let imgicon = item.SystemIcon;
									let imgstyle = {
										width: "60px",
										height: "60px",
										left: "20px",
										top: "15px",
										position: "absolute",
									};
									if (imgicon != "hvac.svg") {
										imgstyle = {
											width: "60px",
											height: "60px",
											left: "20px",
											top: "15px",
											position: "absolute",
										};
									} else {
										imgstyle = {
											width: "100px",
											height: "60px",
											left: "0px",
											top: "25px",
											position: "absolute",
										};
									}
									return (
										<div className="faultdetection-system-box-container">
											<div
												className={`faultdetection-system-box ${
													item.SystemKey === SystemKey
														? "faultdetection-system-box-select"
														: ""
												}`}
												onClick={() => {
													setSystemKey(item.SystemKey);
												}}
											>
												<div className="faultdetection-system-icons">
													<img
														src={`/Resources/CMAT/img/assetcategories/${imgicon}`}
														style={{
															width: imgstyle.width,
															height: imgstyle.height,
															left: imgstyle.left,
															top: imgstyle.top,
															position: "absolute",
														}}
													/>
												</div>
												<div className="faultdetection-system-box-text">
													{item.SystemShortName}
												</div>
												<div
													className="faultdetection-system-failcount"
													style={{
														visibility: Notifyvisibility(item.FailCount),
														width: Notifywidth(item.FailCount),
													}}
												>
													{item.FailCount}
												</div>
											</div>
										</div>
									);
								}}
							/>
						</div>
					</div>
					<div className="faultydetection-Column" style={{ width: "30%" }}>
						<div
							style={{
								width: "270px",
								paddingRight: "20px",
								paddingTop: "60px",
								marginRight: "10px",
								position: "relative",
								float: "right",
							}}
						>
							<div className="faultydetection-body-search-container">
								<div className="faultydetection-body-search-lable">
									Asset Name
								</div>
								<SearchBox
									value={queryAssetID}
									//className=''
									onChange={(newValue) => {
										setqueryAssetID(newValue);
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="FaultyDetectionWidget-Tablecontainer">
					{LoadDataList && (
						<FaultyDetectionTable
							FaultyDataSet={
								queryAssetID != "" ? FilterFaultyDataSet : FaultyDataSet
							}
							LocationKey={LocationKey}
							CurrencyType={CurrencyType}
							Offset={TimeOffset}
							TableHeight="370px"
							RSProcess="Include Process"
							uxpContext={props.uxpContext}
						/>
					)}
					{!LoadDataList && SystemList.length != 0 && <Loading />}
				</div>
			</div>
		</WidgetWrapper>
	);
};
export default FaultyDetection;

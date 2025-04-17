import * as React from 'react';
import { TitleBar, Select, WidgetWrapper, Button,FormField, FilterPanel,Label,Tooltip,useToast} from "uxp/components";
import { IContextProvider } from '../uxp';
import './SystemHeatMap.scss';
import Highcharts, { Point } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HC_more from 'highcharts/highcharts-more';
import HC_BUllet from 'highcharts/modules/bullet';
HC_more(Highcharts);
HC_BUllet(Highcharts);
import axios, {AxiosResponse} from 'axios';

import SystemFailureHeatMapHour from './SystemSummaryHeatMap/SystemFailureHeatMapHour';
import SystemFailureHeatMapDay from './SystemSummaryHeatMap/SystemFailureHeatMapDay';
import SystemFailureHeatMapMonth from './SystemSummaryHeatMap/SystemFailureHeatMapMonth';

interface IProps {
    uxpContext?: IContextProvider
}

const SystemFailureHeatMap: React.FunctionComponent<IProps> = (props) => {

    const baseurl = window.location.origin;
    // const baseurl = 'http://c2o.iviva.com';
    //const baseurl = 'https://ssi.iviva.cloud';
    const [Locationlist, setLocationList] = React.useState([]);
    const [Locationkey, setLocationKey] = React.useState(null);
    const [LocationID, setLocationID] = React.useState('');

    const[ProcessDate, setProcessDate] = React.useState(new Date());
    const [CurrencyType,setCurrencyType] = React.useState(null);
    
    const [Systemlist, setSystemlist] = React.useState([]);
    const [TimeOffset, setTimeOffset] = React.useState(null);
    const[CurrentDay, setCurrentDay] = React.useState(null);
    const [selectedYear, setSelectedYear] = React.useState(null);
    const [yearList,setyearList]=React.useState([]);
    const [Systemkey, setSystemkey] = React.useState(null);
    const [SystemID, setSystemID] = React.useState('');


    let toast = useToast();
    async function GetLocations() {
        let execurl = `${baseurl}/api/CMAT/Orphans/GetBuildings`;
        axios.get(`${execurl}?apikey=${props.uxpContext?.apiKey}&LocationTypeKey=2`)
        .then(response => {
            let res : any[] = response.data;
            setLocationList(res);
            setTimeOffset(res.length>0 ? res[0].TimeOffset : null);
            setLocationKey(res.length>0 ? res[0].LocationKey : null);
            setCurrencyType(res.length>0 ? res[0].Currency : null);
        })
        .catch(e => {
            console.log("except: ", e);
            setLocationList([]);
            toast.error("Something went wrong");
        })
    }
    React.useEffect(() => {
        console.log("GetLocations");
        GetLocations();
    }, []);

    async function GetAllSystems() {
        setSystemkey(null);
        if(Locationkey != null){
            let appurl = 'CMAT/CMATUXPDashboard';
            let execurl = `${baseurl}/api/${appurl}/GetAllSystemsAPI`;
            let parm = `&LocationKey=${Locationkey}`
            axios.get(`${execurl}?apikey=${props.uxpContext?.apiKey}${parm}`)
            .then(response => {
                let res : any[] = response.data;
                res.shift();
                setSystemlist(res);
                if(res.length>0){
                    setSystemkey(res[0].SystemKey);
                    setSystemID(res[0].SystemID);
                }
            })
            .catch(e => {
                console.log("except: ", e);
                setSystemlist ([]);
                setSystemID('');
                toast.error("Something went wrong");
            })
        }
    }
    function GetYearList(startYear: number) {
        var currentYear = new Date().getFullYear(), years = [];
        startYear = startYear || 1980;  
        while ( currentYear > startYear) {
            var VariationYear = currentYear--
            var yearob= { label:VariationYear.toString(), value: VariationYear.toString()}
            years.push(yearob);
        }   
        return years;
    }

    React.useEffect(() => {
        if(Locationkey != null && TimeOffset != null){
            setyearList(GetYearList(2019));
            let dtx = new Date();
            let prefix = parseFloat(dtx.getTimezoneOffset().toString())+parseFloat(TimeOffset);
            let curdax = new Date(new Date().getTime() + prefix*60000);
            setCurrentDay(curdax);
            GetAllSystems();
        }
    }, [Locationkey]);

    React.useEffect(() => {
        if(yearList.length > 0 && CurrentDay != null){
            setSelectedYear((CurrentDay.getFullYear()).toString());
        }
    }, [yearList,CurrentDay]);

    const [MonthList, setMonthList] = React.useState([]);
    const [selectedMonth, setselectedMonth] = React.useState(null);

    React.useEffect(() => {
        if(CurrentDay != null){
            if(Locationkey != null && TimeOffset!= null && yearList.length>0 && CurrentDay != null && selectedYear != null && Systemkey != null){
                if((CurrentDay.getFullYear() != selectedYear && selectedMonth == 12) || (CurrentDay.getMonth() == 11 && selectedMonth == 12)){
                    console.log("do it");
                    SelectHeatMap();
                }
            }
            
            let mnthlst = SeleCtDropMonth();
            setMonthList(mnthlst);
            if(mnthlst.length>0){
                setselectedMonth(mnthlst[0].value);
            }
        }
    }, [selectedYear]);


    React.useEffect(() => {
        if(Locationkey != null && TimeOffset!= null && yearList.length>0 && CurrentDay != null && selectedYear != null && MonthList.length>0 && selectedMonth !=null && Systemkey != null){
            console.log("do it");
            SelectHeatMap();
        }
    }, [selectedMonth,Systemkey]);

    React.useEffect(() => {
        if(TimeOffset != null ){
            let dtxv = new Date();
            setProcessDate(new Date(dtxv.getTime() + ((parseFloat(TimeOffset)+dtxv.getTimezoneOffset())*60000)));
        }
    }, [TimeOffset]);


    const monthList=[
        { label:"DEC", value:"12"},
        { label:"NOV", value:"11"},
        { label:"OCT", value:"10"},
        { label:"SEP", value:"9"},
        { label:"AUG", value:"8"},
        { label:"JUL", value:"7"},
        { label:"JUN", value:"6"},
        { label:"MAY", value:"5"},
        { label:"APR", value:"4"},
        { label:"MAR", value:"3"},
        { label:"FEB", value:"2"},
        { label:"JAN", value:"1"}
    ];

    function SeleCtDropMonth(){
        let nowyear= (CurrentDay.getFullYear()).toString();
        let nowmonth = (CurrentDay.getMonth()+1);
        let months = [];
        if(selectedYear == nowyear){
            for(let x=nowmonth;x>0;x--){
                var __FOUNDMonth = monthList.find(function(post, index) {
                    if(post.value == (x).toString()){
                        return post.label;
                    }
                });
                if(__FOUNDMonth != undefined){
                    months.push(__FOUNDMonth);
                }
            }
        }
        else{
            months= monthList;
        }
        return(months);
    }

    const [ShowingCategory, setShowingCategory] = React.useState('M');

    const [ShowingHeatMap, setShowingHeatMap] = React.useState(<div></div>);

    React.useEffect(() => {
        SelectHeatMap();
    }, [ShowingCategory,ProcessDate]);

    function SelectHeatMap(){
        if(ShowingCategory === 'D'){
            setShowingHeatMap(<SystemFailureHeatMapHour
                Systemkey={Systemkey}
                Locationkey={Locationkey}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                SystemList={Systemlist}
                Locationlist={Locationlist}
                TimeOffSet={TimeOffset}
                CurrencyType = {CurrencyType}
                ProcessDate ={ProcessDate}
                Location = {LocationID}
                System = {SystemID}
                uxpContext = {props.uxpContext}
            />);
        }
        else if(ShowingCategory === 'M'){
            setShowingHeatMap(<SystemFailureHeatMapDay
                Systemkey={Systemkey}
                Locationkey={Locationkey}
                selectedYear={selectedYear}
                SystemList={Systemlist}
                Locationlist={Locationlist}
                TimeOffSet={TimeOffset}
                CurrencyType = {CurrencyType}
                ProcessDate ={ProcessDate}
                Location = {LocationID}
                System = {SystemID}
                uxpContext = {props.uxpContext}
            />);
        }
        else{
            setShowingHeatMap(<SystemFailureHeatMapMonth
                Systemkey={Systemkey}
                Locationkey={Locationkey}
                selectedYear={selectedYear}
                SystemList={Systemlist}
                Locationlist={Locationlist}
                TimeOffSet={TimeOffset}
                CurrencyType = {CurrencyType}
                ProcessDate ={ProcessDate}
                Location = {LocationID}
                System = {SystemID}
                uxpContext = {props.uxpContext}
            />);
        }
    }

    return(
        <WidgetWrapper>
            <TitleBar title='System Availability Map' icon="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+IDxzdmcgaWQ9IkxheWVyXzEiIGRhdGEtbmFtZT0iTGF5ZXIgMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMTI4IDEyOCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMzYjQ1NTE7fS5jbHMtMntmaWxsOiMyYjc3YzA7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5hPC90aXRsZT48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik02My44MDczMiwxLjYzMTgxQTYyLjA2MTM0LDYyLjA2MTM0LDAsMCwwLDIuMjE0LDU0LjExNDc0bDExLjE3MzkzLDEuNzc5YTUxLjA2Mzc2LDUxLjA2Mzc2LDAsMCwxLDEwMS40NzgzMSw4LjExMDQyLDUxLjQ3Miw1MS40NzIsMCwwLDEtMS4wMDEzNywxMC4xMTg2OWwxMS4wOTM4MiwyLjIyNjVBNjIuNDI0NDcsNjIuNDI0NDcsMCwwLDAsNjMuODA3MzIsMS42MzE4MVoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik03NC44NTYyNSwxMDIuMjM5NzlhNDEuNzE3NzIsNDEuNzE3NzIsMCwwLDEtMjMuNzYxLDMuMzk0NDhBNDIuNTkxNTcsNDIuNTkxNTcsMCwwLDEsMzguNzYyLDEwMS44NDM3M2E0My4wMjM0Myw0My4wMjM0MywwLDAsMS0xMS4yMDE1NS03LjUyNDI3QTQ3LjE5MTg2LDQ3LjE5MTg2LDAsMCwxLDE4LjY3ODI3LDgzLjUxMzhhNTQuMDc5NjgsNTQuMDc5NjgsMCwwLDEtNS41NzI2My0xMy40MDhsLTUuNTAxNjcuNjYzNS01Ljc4NS4wMTY1Ny4wNDAwNS42NzY3OUE2Mi4zODQsNjIuMzg0LDAsMCwwLDExMC45ODkxOSwxMDQuNzhWODQuODQ0NzZMOTEuMDkzLDg3LjU1ODgyQTM3LjgxNjUzLDM3LjgxNjUzLDAsMCwxLDc0Ljg1NjI1LDEwMi4yMzk3OVoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik01Mi40NDk3LDUwLjU0MzY0YTIuMDA0MzMsMi4wMDQzMywwLDAsMC0yLjAwNDEyLDIuMDA0MTJ2OS45Njk4NmE0Ljk4OTUyLDQuOTg5NTIsMCwwLDAsNS4xNTI3NSw1LjE1Mjc1aDUuMzQyNDl2Ny43ODE4N2EyLjAwNCwyLjAwNCwwLDEsMCw0LjAwODA4LDBWNTIuNTQ3NzZhMi4wMDQsMi4wMDQsMCwxLDAtNC4wMDgwOCwwVjYzLjY2MjQ3SDU1LjU5ODMyYTEuMDEyLDEuMDEyLDAsMCwxLTEuMTQ0ODQtMS4xNDQ4NFY1Mi41NDc3NkEyLjAwNDE0LDIuMDA0MTQsMCwwLDAsNTIuNDQ5Nyw1MC41NDM2NFoiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik0zMC44MTA0LDc0LjAzNTNhMi4wMDQsMi4wMDQsMCwwLDAsMS40MTY5NCwzLjQyMTA3SDQ2LjA0OTU1YTIuMDA0LDIuMDA0LDAsMCwwLDAtNC4wMDgwOEgzNy4wNjVsOC41MjA4MS04LjUyMDY0QTguNDI2LDguNDI2LDAsMCwwLDMzLjY2OTY2LDUzLjAxMTVMMzIuMjQ1LDU0LjQzNjIxYTIuMDAzNzMsMi4wMDM3MywwLDAsMCwyLjgzMzcxLDIuODMzNzFsMS40MjQ3MS0xLjQyNDcxYTQuNDE4NTIsNC40MTg1MiwwLDAsMSw2LjI0ODczLDYuMjQ4NzNaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNODQuOTk3NzMsNzguMDM5NGExLjk4NTIxLDEuOTg1MjEsMCwwLDAsLjc2MDE4LjE1MTc2LDIuMDA1NjgsMi4wMDU2OCwwLDAsMCwxLjg1NDI2LTEuMjQzNzdMOTcuNjI2MjMsNTIuNTc0YTIuMDA0LDIuMDA0LDAsMCwwLTEuODUzNC0yLjc2NTE3SDgxLjE2M2EyLjAwNCwyLjAwNCwwLDEsMCwwLDQuMDA3OUg5Mi43ODI1M2wtOC44NzY4MSwyMS42MDhBMi4wMDI2MiwyLjAwMjYyLDAsMCwwLDg0Ljk5NzczLDc4LjAzOTRaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNjkuMzQ3MzIsODEuOTI4MThBMi4wMDQyMywyLjAwNDIzLDAsMCwwLDcxLjMyMDg5LDgwLjI2TDc2LjczOCw0OC40MTI3OWEyLjAwMzg2LDIuMDAzODYsMCwwLDAtMy45NTExLS42NzEyNkw2Ny4zNjk3OSw3OS41ODg3N2EyLjAwNCwyLjAwNCwwLDAsMCwxLjk3NzU0LDIuMzM5NDFaIi8+PC9zdmc+">
                <table style={{float:"right",position: "relative"}}>
                    <tbody>
                        <tr>
                            <td style={{width:"400px",paddingRight:"5px"}}>
                                
                            </td>
                            <td style={{width:"300px",paddingRight:"5px"}}>
                                <div style={{float: 'right',marginRight:'20px',width:"325px"}}>
                                    <table><tbody><tr>
                                        <td>
                                            <Tooltip position="bottom" content={() => <div style={{color:"#58f55f"}}>No Faulty Assets</div>} >
                                                <div  style={{backgroundColor:"#a4eda7",borderRadius:"10px",fontWeight:"bolder",padding:'5px'}} >Good</div>
                                            </Tooltip>
                                        </td>
                                        <td>
                                            <Tooltip position="bottom" content={() => <div style={{color:"#f08dd4"}}>Risk Impact Value: 0-300</div>} >
                                                <div  style={{backgroundColor:"#ffd5b9",borderRadius:"10px",fontWeight:"bolder",padding:'5px',marginLeft:"10px"}}>Low Risk</div>
                                            </Tooltip>
                                        </td>
                                        <td>
                                            <Tooltip position="bottom" content={() => <div style={{color:"#feb357"}}>Risk Impact Value: 300-600</div>} >
                                                <div  style={{backgroundColor:"#feb357",borderRadius:"10px",color:"white",fontWeight:"bolder",padding:'5px',marginLeft:"10px"}}  >Medium Risk</div>
                                            </Tooltip>
                                        </td>
                                        <td>
                                            <Tooltip position="bottom" content={() => <div style={{color:"#f76841"}}>Risk Impact Value: 600-1000</div>} >
                                                <div style={{backgroundColor:"#f76841",borderRadius:"10px",color:"white",fontWeight:"bolder",padding:'5px',marginLeft:"10px"}} >High Risk</div>
                                            </Tooltip>
                                        </td>
                                    </tr></tbody></table>
                                </div>
                            </td>
                            
                            <td style={{width:"150px",paddingRight:"5px"}}>
                                <div style={{width:"150px"}}>
                                    <Select 
                                            className={'SystemHeatMap-locationfilter'}
                                            selected={Locationkey}
                                            options={Locationlist}
                                            labelField="LocationID"
                                            valueField="LocationKey"
                                            onChange={(newValue, option) => {
                                                setLocationID(option.LocationID);
                                                setTimeOffset(parseFloat(option.TimeOffset));
                                                setLocationKey(newValue);
                                            }}
                                            showEndOfContent={false}
                                        />
                                </div>
                            </td>
                            <td>
                                <FilterPanel>
                                    <FormField className="no-padding mb-only">
                                        <div style={{width:"250px"}}>
                                            <Button 
                                                title="Day"
                                                onClick = {() => setShowingCategory('D')}
                                                active={ShowingCategory === 'D'}
                                                className="CategorySwitcher-button"
                                            />
                                            <Button 
                                                title="Month"
                                                onClick = {() => setShowingCategory('M')}
                                                active={ShowingCategory === 'M'}
                                                className="CategorySwitcher-button"
                                            />
                                            <Button 
                                                title="Year"
                                                onClick = {() => setShowingCategory('Y')}
                                                active={ShowingCategory === 'Y'}
                                                className="CategorySwitcher-button"
                                            />
                                        </div>
                                    </FormField>
                                    <FormField className="no-padding mb-only">
                                        <div style={{width:"300px"}}>
                                            <Select 
                                                className={'SystemHeatMap-systemfilter'}
                                                selected={Systemkey}
                                                options={Systemlist}
                                                showEndOfContent={false}
                                                labelField="SystemID"
                                                valueField="SystemKey"
                                                onChange={(newValue, option) => {
                                                    setSystemID(option.SystemID);
                                                    setSystemkey(newValue);
                                                }}
                                            />
                                        </div>
                                    </FormField>
                                    <FormField className="no-padding mb-only">
                                        <table><tbody><tr>
                                            {ShowingCategory==='D' &&
                                            <td style={{width:"100px",paddingRight:"35px" }}>
                                                <Label>Month</Label>
                                                <div id='monthselect' style={{width:"100px"}}>
                                                    <Select 
                                                        className={'SystemHeatMap-yearfilter'}
                                                        selected={selectedMonth}
                                                        options={MonthList}
                                                        onChange={setselectedMonth}
                                                        showEndOfContent={false}
                                                    />
                                                </div>
                                            </td>
                                            }
                                            <td style={{width:"100px"}}>
                                                <Label>Year</Label>
                                                <div style={{width:"100px"}}>
                                                    <Select 
                                                        className={'SystemHeatMap-yearfilter'}
                                                        selected={selectedYear}
                                                        options={yearList}
                                                        onChange={setSelectedYear}
                                                        showEndOfContent={false}
                                                    />
                                                </div>
                                            </td>
                                        </tr></tbody></table>
                                    </FormField>
                                </FilterPanel>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </TitleBar>
            
            <div style={{}}>{ShowingHeatMap}</div>
            
        </WidgetWrapper>
    )
}
export default SystemFailureHeatMap;
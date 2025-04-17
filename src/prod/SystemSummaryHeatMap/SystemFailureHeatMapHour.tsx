import * as React from 'react';
import { Modal, useToast } from "uxp/components";
import { IContextProvider } from '../../uxp';
import HighchartsReact from 'highcharts-react-official';
import HC_more from 'highcharts/highcharts-more';
import Highcharts from 'highcharts/highmaps';
HC_more(Highcharts);

import HourlyDetailPopup from './FailureHeatMap/HourlyDetailPopup';
import '../SystemHeatMap.scss';
import './FailureHeatMap/HourViewNormal.scss';
import axios, {AxiosResponse} from 'axios';

type SummaryDetails = {
    x: string;
    y: string;
    color: string;
    Infor: string;
    Xvalue:string;
};

type SelectSysList = {
    SystemID: string;
    SystemKey: string;
};

type SelectLocList = {
    LocationID: string;
    LocationKey: string;
};

type OfftimeData = {
    OffTime: string;
    OnTime: string;
};

type DBData = {
    "Hour": string;
    "Day": string;
    "FailCount": string;
    "RiskStatus": string;
};

interface IProps {
    Systemkey:string;
    Locationkey:string;
    selectedYear:string;
    selectedMonth:string;
    SystemList:SelectSysList[];
    Locationlist:SelectLocList[];
    TimeOffSet:number;
    CurrencyType:string;
    ProcessDate:Date; 
    Location:string;
    System:string;
    uxpContext?: IContextProvider;
}

const SystemFailureHeatMapHour: React.FunctionComponent<IProps> = (props) => {

    const [LastChartData, setLastChartData] = React.useState([]);
    const [XaxisCategory, setXaxisCategory] = React.useState([]);
    const [showPopup, setshowPopup] = React.useState(false);
    const [DetailsPopup, setDetailsPopup] = React.useState<SummaryDetails>(null);

    const [Ymin, setYmin] = React.useState(1);
    const [ChHeight, setChHeight] = React.useState(540);
    const [ShowAll, setShowAll] = React.useState(false);

    
    const [Offtime, setOfftime] = React.useState({OffTime:"0",OnTime:"0"});
    const [SystemName, setSystemName] = React.useState('');
    const [LocationName, setLocationName] = React.useState('');

    React.useEffect(() => {
        setYmin((GetYaxisCategoryList()>15? (GetYaxisCategoryList()-15) : 1));
    }, [props]);
    React.useEffect(() => {
        GetOfftime();
    }, [props.Systemkey,props.selectedYear,props.selectedMonth]);
    React.useEffect(() => {
        if(ShowAll){
            setChHeight(670);
            setYmin(1);
        }
        else{
            setChHeight(540);
            setYmin((GetYaxisCategoryList()>15? (GetYaxisCategoryList()-15) : 1));
        }
    }, [ShowAll]);

    React.useEffect(() => {
        GetSelectedSystem();
    }, [props.Systemkey]);
    async function GetSelectedSystem(){
        var __FOUNDBase =await props.SystemList.find(function(post, index) {
            if(post.SystemKey == (props.Systemkey).toString()){
                return post.SystemID;
            }
        });
        if(__FOUNDBase != undefined){
            setSystemName(__FOUNDBase.SystemID);
        }
    }

    React.useEffect(() => {
        GetSelectedLocation();
    }, [props.Locationkey]);
    async function GetSelectedLocation(){
        var __FOUNDBase =await props.Locationlist.find(function(post, index) {
            if(post.LocationKey == (props.Locationkey).toString()){
                return post.LocationID;
            }
        });
        if(__FOUNDBase != undefined){
            setLocationName(__FOUNDBase.LocationID);
        }
    }

    async function GetOfftime(){
        if(props.Systemkey != null && props.selectedYear != null && props.selectedMonth != null){
            let appurl = 'CMAT/Orphans';
            let baseurl = window.location.origin;
            let execurl = `${baseurl}/api/${appurl}/SystemOnOffTimeAPI`;
            let parm = `&Year=${props.selectedYear}&Month=${props.selectedMonth}&SystemKey=${parseInt(props.Systemkey)}&TimeOffSet=${props.TimeOffSet}`
            axios.get(`${execurl}?apikey=${props.uxpContext?.apiKey}${parm}`)
            .then(response => {
                let res : any[] = response.data;
                if(res.length > 0){
                    OfftimeSeting({OffTime:res[0]['OffTime'],OnTime:res[0]['OnTime']});
                }
            })
            .catch(e => {
                console.log("except: ", e);
                toast.error("Something went wrong");
            })
        }
        
        //OfftimeSeting({OffTime:"2",OnTime:"7"});
    }

    async function OfftimeSeting(onofftimes:OfftimeData){
        setOfftime(onofftimes);
        let Xarray = await DesignXAxis(onofftimes);
        GetFromDB(Xarray);
    }

    async function OrganizeData(DBdataArray:DBData[],xaxisdata:string[]){
        var organizedDataList =[];
        for(var i=1; i<= GetYaxisCategoryList(); i++ ){
            for(var j=0; j< xaxisdata.length; j++ ){
                var __FOUND =await DBdataArray.find(function(post, index) {
                    if(post.Day == i.toString() && post.Hour == (parseInt(xaxisdata[j])-1).toString()){
                        return true;
                    }
                });
                if(__FOUND === undefined){
                    if(props.selectedMonth==(props.ProcessDate.getMonth()+1).toString() && i==GetYaxisCategoryList() && (parseInt(xaxisdata[j])-1)> parseInt((props.ProcessDate.getHours()).toString()) ){
                        organizedDataList.push({x:j, y:i,color: "#A0A8A2",Infor:"Off Time",Xvalue:xaxisdata[j].toString()});
                    }
                    else{
                        organizedDataList.push({x:j, y:i,color: "#a4eda7",Infor:"Good",Xvalue:xaxisdata[j].toString()});
                    }
                }
                else{
                    if(props.selectedMonth==(props.ProcessDate.getMonth()+1).toString() && i==GetYaxisCategoryList() && (parseInt(xaxisdata[j])-1)> parseInt((props.ProcessDate.getHours()).toString()) ){
                        organizedDataList.push({x:j, y:i,color: "#A0A8A2",Infor:"Off Time",Xvalue:xaxisdata[j].toString()});
                    }
                    else if(__FOUND.RiskStatus=="High"){
                        organizedDataList.push({x:j, y:i,color: "#f76841",Infor:"High Risk",Xvalue:xaxisdata[j].toString()});
                    }
                    else if(__FOUND.RiskStatus=="Low"){
                        organizedDataList.push({x:j, y:i,color: "#ffd5b9",Infor:"Low Risk",Xvalue:xaxisdata[j].toString()});
                    }
                    else if(__FOUND.RiskStatus=="Medium"){
                        organizedDataList.push({x:j, y:i,color: "#feb357",Infor:"Medium Risk",Xvalue:xaxisdata[j].toString()});
                    }
                    else if(__FOUND.RiskStatus=="Medium&Low" || __FOUND.RiskStatus=="Low&Medium"){
                        organizedDataList.push({x:j, y:i,
                            color: {
                                linearGradient: {
                                x1: 0,
                                x2: 1,
                                y1: 0,
                                y2:0
                                },
                                stops: [
                                [0, '#feb357'],
                                [1, '#ffd5b9']
                                ]
                            }
                            ,Infor:"Medium Risk,Low Risk",Xvalue:xaxisdata[j].toString()});
                    }
                    else if(__FOUND.RiskStatus=="High&Medium&Low" || __FOUND.RiskStatus=="Low&Medium&High"){
                        organizedDataList.push({x:j, y:i,
                            color: {
                                linearGradient: {
                                x1: 0,
                                x2: 0.7,
                                x3: 2,
                                y1: 0,
                                y2:0
                                },
                                stops: [
                                [0, '#f76841'],
                                [0.7, '#ffd5b9'],
                                [1, '#feb357']
                                ]
                            }
                            ,Infor:"High Risk,Medium Risk,Low Risk",Xvalue:xaxisdata[j].toString()});
                    }
                    else if(__FOUND.RiskStatus=="High&Medium" || __FOUND.RiskStatus=="Medium&High"){
                        organizedDataList.push({x:j, y:i,
                            color: {
                                linearGradient: {
                                x1: 0,
                                x2: 1,
                                y1: 0,
                                y2:0
                                },
                                stops: [
                                [0, '#f76841'],
                                [1, '#feb357']
                                ]
                            }
                            ,Infor:"High Risk,Medium Risk",Xvalue:xaxisdata[j].toString()});
                    }
                    else{
                        organizedDataList.push({x:j, y:i,
                        color: {
                            linearGradient: {
                            x1: 0,
                            x2: 1,
                            y1: 0,
                            y2:0
                            },
                            stops: [
                            [0, '#ffd5b9'],
                            [1, '#f76841']
                            ]
                        }
                        ,Infor:"High Risk,Low Risk",Xvalue:xaxisdata[j].toString()});
                    }
                }
            }  
        }
        setLastChartData(organizedDataList);
    }

    function DesignXAxis(shedule : OfftimeData){
        // var OffTimeH = Offtime.OffTime != ''? parseInt(Offtime.OffTime) : '';
        // var OnTimeH = Offtime.OnTime != ''? parseInt(Offtime.OnTime) : '';
        var OffTimeH = shedule.OffTime != ''? parseInt(shedule.OffTime) : '';
        var OnTimeH = shedule.OnTime != ''? parseInt(shedule.OnTime) : '';
        console.log(OffTimeH,OnTimeH,"OffTimeHOnTimeH");
        var xaxisArray=[];
        if(OffTimeH != '' && OnTimeH !='' && OffTimeH < OnTimeH){
            for(var k=1; k<= 24; k++ ){
                if(k<=OffTimeH || k>OnTimeH){
                    xaxisArray.push(k.toString());
                }
            }
        }
        else if(OffTimeH != '' && OnTimeH !='' && OffTimeH > OnTimeH){
            for(var k=1; k<= 24; k++ ){
                if(k<=OffTimeH && k>OnTimeH){
                    xaxisArray.push(k.toString());
                }
            }
        }
        else{
            for(var k=1; k<= 24; k++ ){
                xaxisArray.push(k.toString());
            }
        }
        setXaxisCategory(xaxisArray);
        return xaxisArray;
    }

    let toast = useToast();
    async function GetFromDB(xaxis :string[]){
        if(props.Systemkey != null && props.selectedYear != null && props.selectedMonth != null){
            let appurl = 'CMAT/CMATAssetMonthlyUptime';
            let baseurl = window.location.origin;
            let execurl = `${baseurl}/api/${appurl}/HourlySelectSystemAvailabilityAPI`;
            let parm = `&Year=${props.selectedYear}&Month=${props.selectedMonth}&SystemKey=${parseInt(props.Systemkey)}`
            axios.get(`${execurl}?apikey=${props.uxpContext?.apiKey}${parm}`)
            .then(response => {
                let res : any[] = response.data;
                OrganizeData(res,xaxis);
            })
            .catch(e => {
                console.log("except: ", e);
                setLastChartData([]);
                toast.error("Something went wrong");
            })
        }
    }
    // async function GetFromDB(xaxis :string[]){
    //     if(props.selectedYear != null && props.selectedMonth != null && props.Systemkey != null && props.TimeOffSet != null){
    //         props.uxpContext?.executeAction("C2ODashboard", "GetHeatMapHourMapping", {YearIn:props.selectedYear,MonthIn:props.selectedMonth,TimeZoneIn:props.TimeOffSet,Systemkey:parseInt(props.Systemkey)}, { json: true })
    //         .then(res => {
    //             OrganizeData(res,xaxis);
            
    //         })
    //             .catch(e => {
    //             console.log("except: ", e);
    //             setLastChartData([]);
    //             toast.error("Something went wrong");
    //         })
    //     }
    // }
    
    function GetYaxisCategoryList(){
        if(props.selectedMonth != ((props.ProcessDate.getMonth()+1).toString())){
            if(props.selectedMonth == '4' || props.selectedMonth == '6' || props.selectedMonth == '9' || props.selectedMonth == '11'){
                return(30);
            }
            else if(props.selectedMonth == '2'){
                if(parseInt(props.selectedYear) % 4 === 0  ){
                    return(29);
                }
                else{
                    return(28);
                }
            }
            else{
                return(31);
            }
        }
        else{
            return( parseInt((props.ProcessDate.getDate()).toString()) );
        }
        
    }
    function CheckTwonumber(num:any){
        let gs = num.toString();
        if(gs.length <2){
            return('0'+gs) ;
        }
        else{
            return gs;
        }
    }

    const optionsChart = {
        title: {
            text: '',
            style: {
                fontWeight: 'bold',
                fontSize:"12px"
            }
        },
        chart:{
            type: 'heatmap',
            plotBorderWidth: 1,
            height:ChHeight,
            width:1290
        },
        credits: {
            enabled: false
        },
        xAxis: [{
                //tickInterval:1,
                //min:1,
                //max:24,
                categories:XaxisCategory,
                //categories: ['1','2','3','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24'],
                tickWidth: 0,
                labels: {
                    useHTML: true,
                    formatter: function() {
                        var xlbl ='';
                        if(this.value>12 && this.value<=24){
                            xlbl= `${CheckTwonumber(this.value-12)}pm`;
                        }
                        else{
                            xlbl= `${CheckTwonumber(this.value)}am`;
                        }
                        return '<span class="HourViewNormal-hc-label-downx">' + xlbl + '</span>';
                    },
                    // style: {
                    //     fontSize: 11,
                    //     fontFamily: "monospace",
                    //     fontWeight:"bolder"
                    // }
                },
                title: {
                    y:10,
                    text: 'Hour',
                    style: {
                        fontSize: 13,
                        fontFamily: 'monospace',
                        fontWeight:'bolder'
                    }
                }
            },{
                //tickInterval:1,
                //min:1,
                //max:24,
                linkedTo: 0,
                categories:XaxisCategory,
                //categories: ['1','2','3','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24'],
                tickWidth: 0,
                opposite: true,
                labels: {
                    useHTML: true,
                    formatter: function() {
                        var xlbl ='';
                        if(this.value>12){
                            xlbl= `${CheckTwonumber(this.value-12)}pm`;
                        }
                        else{
                            xlbl= `${CheckTwonumber(this.value)}am`;
                        }
                        
                        return '<span class="HourViewNormal-hc-label-upx">' + xlbl + '</span>';
                    },
                    // style: {
                    //     fontSize: 11,
                    //     fontFamily: "monospace",
                    //     fontWeight:"bolder"
                    // }
                },
                title: {
                    y:-10,
                    text: 'Hour',
                    style: {
                        fontSize: 13,
                        fontFamily: 'monospace',
                        fontWeight:'bolder'
                    }
                }
            },
        ],
        yAxis: 
            {
                tickInterval:1,
                min:Ymin,
                max:GetYaxisCategoryList(),
                labels: {
                    style: {
                        fontSize: 13,
                        fontFamily: "monospace",
                        fontWeight:"bolder"
                    }
                },
                reversed: true,
                title: {
                    text: 'Date',
                    style: {
                        fontSize: 13,
                        fontFamily: 'monospace',
                        fontWeight:'bolder'
                    }
                }
            },
            tooltip: {
                useHTML: true,
                backgroundColor: 'rgba(0,0,0,0)',
                borderWidth: 0,
                formatter: function () {
                    let staus : string[]= this.point.options.Infor.split(',');
                    let messagecolor ="";
                    let riskmessages : string="";
                    var messages = staus.map((obj, i) => {
                        if(obj=="High Risk"){
                            messagecolor="#f76841";
                            riskmessages=riskmessages+`<tr><td>
                                <div style="width:10px; height:10px; background-color:#f76841"></div>
                            </td><td>${obj}</td></tr>`;
                        }
                        else if(obj=="Low Risk"){
                            messagecolor="#ffd5b9";
                            riskmessages=riskmessages+`<tr><td>
                                <div style="width:10px; height:10px; background-color:#ffd5b9"></div>
                            </td><td>${obj}</td></tr>`;
                        }
                        else if(obj=="Medium Risk"){
                            messagecolor="#feb357";
                            riskmessages=riskmessages+`<tr><td>
                                <div style="width:10px; height:10px; background-color:#feb357"></div>
                            </td><td>${obj}</td></tr>`;
                        }
                        else if(obj=="Good"){
                            messagecolor="#a4eda7";
                            riskmessages=riskmessages+`<tr><td>
                                <div style="width:10px; height:10px; background-color:#a4eda7"></div>
                            </td><td>${obj}</td></tr>`;
                        }
                        else{
                            riskmessages="";
                        }
                        return (<td></td>)
                    });
                    return `<div style="background-color:white; padding:10px; border:1px solid ${this.color};"><b>${props.selectedYear}</b>-<b>${props.selectedMonth}</b>-<b>${this.point.options.y}</b><b> ${this.point.options.Xvalue}h</b> <br><b>
                        </b>  <br><b><table><tbody>${riskmessages}</tbody></table></b></div>`;
                },
                style: {
                    zIndex: 100
                }
            },
        legend: {
            enabled:false
        },
        plotOptions: {
            series: {
                cursor: 'pointer',
                borderColor:'#b0abf5',borderWidth:3,
                states: {
                	hover: {
                  	brightness: -0.3
                  }
                },
                events: {
                    click: function (event :any) {
                        var str = event.point.series.yAxis.categories[event.point.y] + ',' +
                                event.point.series.xAxis.categories[event.point.x];

                        setDetailsPopup(event.point.options);
                        console.log(event.point.options,"plpglrpgllkh");
                        setshowPopup(true);
                    }
                }
            }
        },
        series: [{
            name: '',
            borderWidth: 1,
            data: LastChartData,
            dataLabels: {
                enabled: true,
                color: '#000000'
            }
        }],
    
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    yAxis: {
                        labels: {
                            formatter: function () {
                                return this.value.charAt(0);
                            }
                        }
                    }
                }
            }]
        }
    }

    function ShowingFaultDetailPopup(showingStatus:boolean,selectedPeriod:SummaryDetails){
        if(showingStatus){
            if(selectedPeriod.Infor != 'Good'){
                if(props.ProcessDate.getFullYear().toString()=== props.selectedYear){
                    if((props.ProcessDate.getMonth()+1).toString()=== props.selectedMonth){
                        if((props.ProcessDate.getDate())=== parseInt(selectedPeriod.y)){
                            if(parseInt(selectedPeriod.Xvalue) <= (parseInt((props.ProcessDate.getHours()).toString())+1)){
                                return (true);
                            }
                            else{
                                return (false);
                            }
                        }
                        else{
                            return (true);
                        }
                    }
                    else{
                        return (true);
                    }
                }
                else{
                    return (true);
                }
            }
            else{
                return (false);
            }
        }
        else{
            return (false);
        }
    }

    return(
        <div>
            <div style={{marginTop:"-5px",width:"100%"}}>
                <div style={{position:"relative",marginTop:"-5px",height:`${ChHeight+10}px`}}>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={optionsChart}
                    />
                    {/* <div style={{backgroundColor:"rgba(218, 111, 148, 0.281)",zIndex:0,position:"absolute",left:"63px",top:"22px",borderRadius:"10px",width:"1218px",height:"25px"}}>
                    </div>
                    <div style={{backgroundColor:"rgba(218, 111, 148, 0.281)",zIndex:0,position:"absolute",left:"63px",bottom:"34px",borderRadius:"10px",width:"1218px",height:"25px"}}>
                    </div>
                    <div className="HourViewNormal-yaxislable" style={{height:`${670-100}px`}}>
                    </div> */}
                    <div className="HourViewNormal-more-updownIcon-container">
                        <div className={`HourViewNormal-more-${ShowAll? 'upIcon' : 'downIcon'}`}
                            onClick={() => {
                                setShowAll(!ShowAll);
                            }}
                        >
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                //show={(showPopup && (DetailsPopup.Infor != 'Good') && parseInt(DetailsPopup.Xvalue) <(parseInt((CurrentDate.getHours()).toString())+1) && (props.selectedMonth == ((CurrentDate.getMonth()+1).toString())) && parseInt(DetailsPopup.y)==(parseInt((CurrentDate.getDate()).toString())) )  || (showPopup && (props.selectedMonth == ((CurrentDate.getMonth()+1).toString())) && parseInt(DetailsPopup.y)!=(parseInt((CurrentDate.getDate()).toString())) ) || (showPopup && (props.selectedMonth != ((CurrentDate.getMonth()+1).toString())) )}
                show={ShowingFaultDetailPopup(showPopup,DetailsPopup)}
                onOpen={() => { }}
                onClose={() => setshowPopup(false)}
                title={`System Defects ( ${props.System} )`}
                styles={{}}
            >
                <HourlyDetailPopup 
                    DetailOBJ={DetailsPopup}
                    System={props.Systemkey}
                    Location={props.Locationkey}
                    Year={props.selectedYear}
                    Month={props.selectedMonth}
                    LocationName={props.Location}
                    TimeOffSet={props.TimeOffSet}
                    CurrencyType={props.CurrencyType}
                    uxpContext = {props.uxpContext}
                />
            </Modal>
        </div>
    )
}
export default SystemFailureHeatMapHour;
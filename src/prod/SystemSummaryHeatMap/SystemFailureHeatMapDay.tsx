import * as React from 'react';
import { Modal, useToast } from "uxp/components";
import { IContextProvider } from '../../uxp';
import HighchartsReact from 'highcharts-react-official';
import HC_more from 'highcharts/highcharts-more';
import Highcharts from 'highcharts/highmaps';
HC_more(Highcharts);

import DailyDetailPopup from './FailureHeatMap/DailyDetailPopup';
import '../SystemHeatMap.scss';
import './FailureHeatMap/HourViewNormal.scss';
import axios, {AxiosResponse} from 'axios';

type SummaryDetails = {
    x: string;
    y: string;
    color: string;
    Infor: string;
    Xvalue:string;
    Yvalue:string;
};


type OfftimeData = {
    OffTime: string;
    OnTime: string;
};

type DBData = {
    "Month": string;
    "Day": string;
    "FailCount": string;
    "RiskStatus": string;
};
type SelectList = {
    label: string;
    value: string;
};
interface IProps {
    Systemkey:string;
    Locationkey:string;
    selectedYear:string;
    SystemList:SelectList[];
    Locationlist:SelectList[];
    TimeOffSet:number;
    CurrencyType:string;
    ProcessDate:Date; 
    Location:string;
    System:string;
    uxpContext?: IContextProvider;
}

const SystemFailureHeatMapDay: React.FunctionComponent<IProps> = (props) => {

    const [LastChartData, setLastChartData] = React.useState([]);
    const [XaxisCategory, setXaxisCategory] = React.useState([]);
    const [YaxisCategory, setYaxisCategory] = React.useState(['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']);
    const [showPopup, setshowPopup] = React.useState(false);
    const [DetailsPopup, setDetailsPopup] = React.useState<SummaryDetails>(null);

    const [Offtime, setOfftime] = React.useState({OffTime:"",OnTime:""});
    const [SystemName, setSystemName] = React.useState('');
    const [LocationName, setLocationName] = React.useState('');

    React.useEffect(() => {
        DesignXaxis();
    }, [props]);

    React.useEffect(() => {
        GetSelectedSystem();
    }, [props.Systemkey]);
    async function GetSelectedSystem(){
        var __FOUNDBase =await props.SystemList.find(function(post, index) {
            if(post.value == (props.Systemkey).toString()){
                return post.label;
            }
        });
        setSystemName(__FOUNDBase.label);
    }

    React.useEffect(() => {
        GetSelectedLocation();
    }, [props.Locationkey]);
    async function GetSelectedLocation(){
        var __FOUNDBase =await props.Locationlist.find(function(post, index) {
            if(post.value == (props.Locationkey).toString()){
                return post.label;
            }
        });
        setLocationName(__FOUNDBase.label);
    }

    async function DesignXaxis(){
        let xaxiscategory = [];
        for(var k=1;k<=31;k++){
            xaxiscategory.push(k.toString());
        }
        setXaxisCategory(xaxiscategory);
        GetFromDB(xaxiscategory);
    }

    function GetLastDateOfMonth(selectedMonth:string){
        if(selectedMonth != ((props.ProcessDate.getMonth()+1).toString())){
            if(selectedMonth == '4' || selectedMonth == '6' || selectedMonth == '9' || selectedMonth == '11'){
                return(30);
            }
            else if(selectedMonth == '2'){
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

    function ShowingFaultDetailPopup(showingStatus:boolean,selectedPeriod:SummaryDetails){
        if(showingStatus){
            if(parseInt(props.selectedYear) == (props.ProcessDate.getFullYear()) ){
                if(parseInt(selectedPeriod.y)==(props.ProcessDate.getMonth())){
                    if(parseInt(selectedPeriod.x)>(props.ProcessDate.getDate()-1)){
                        return(false);
                    }
                    else{
                        return(true && (selectedPeriod.Infor !='Good'));
                    }
                }
                else if(parseInt(selectedPeriod.y)>(props.ProcessDate.getMonth())){
                    return(false);
                }
                else{
                    return(true && (selectedPeriod.Infor !='Good'));
                }
            }
            else{
                return(true && (selectedPeriod.Infor !='Good'));
            }
        }
        else{
            return(false)
        }
    }

    async function OrganizeData(DBdataArray:DBData[] , xaxisdata:string[]){
        var organizedDataList =[];
        for(var i=0; i<=(parseInt(props.selectedYear) == props.ProcessDate.getFullYear() ? (props.ProcessDate.getMonth()) : 11); i++ ){
            for(var j=0; j< 31; j++ ){
                if((j+1)>GetLastDateOfMonth((i+1).toString())){
                    organizedDataList.push({x:j, y:i,color: "#A0A8A2",Infor:"None",Xvalue:xaxisdata[j].toString(),Yvalue:YaxisCategory[i]});
                }
                else{
                    var __FOUND =await DBdataArray.find(function(post, index) {
                        if(post.Month == (i+1).toString() && post.Day == (j+1).toString()){
                            return true;
                        }
                    });
                    if(__FOUND === undefined){  
                        organizedDataList.push({x:j, y:i,color: "#a4eda7",Infor:"Good",Xvalue:xaxisdata[j].toString(),Yvalue:YaxisCategory[i]});
                    }
                    else{
                        if(__FOUND.RiskStatus=="High"){
                            organizedDataList.push({x:j, y:i,color: "#f76841",Infor:"High Risk",Xvalue:xaxisdata[j].toString(),Yvalue:YaxisCategory[i]});
                        }
                        else if(__FOUND.RiskStatus=="Low"){
                            organizedDataList.push({x:j, y:i,color: "#ffd5b9",Infor:"Low Risk",Xvalue:xaxisdata[j].toString(),Yvalue:YaxisCategory[i]});
                        }
                        else if(__FOUND.RiskStatus=="Medium"){
                            organizedDataList.push({x:j, y:i,color: "#feb357",Infor:"Medium Risk",Xvalue:xaxisdata[j].toString(),Yvalue:YaxisCategory[i]});
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
                                ,Infor:"Medium Risk,Low Risk",Xvalue:xaxisdata[j].toString(),Yvalue:YaxisCategory[i]});
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
                                    [0.8, '#feb357'],
                                    [1, '#ffd5b9']
                                    ]
                                }
                                ,Infor:"High Risk,Medium Risk,Low Risk",Xvalue:xaxisdata[j].toString(),Yvalue:YaxisCategory[i]});
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
                                ,Infor:"High Risk,Medium Risk",Xvalue:xaxisdata[j].toString(),Yvalue:YaxisCategory[i]});
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
                                [0, '#f76841'],
                                [1, '#ffd5b9']
                                ]
                            }
                            ,Infor:"High Risk,Low Risk",Xvalue:xaxisdata[j].toString(),Yvalue:YaxisCategory[i]});
                        }
                    }
                }
                
            }  
        }
        console.log(organizedDataList,"organizedDataList_organizedDataList");
        setLastChartData(organizedDataList);
    }

 

    let toast = useToast();
    async function GetFromDB(xaxisdata:string[]){
        if(props.Systemkey != null && props.selectedYear != null){
            let appurl = 'CMAT/CMATAssetMonthlyUptime';
            //let baseurl = window.location.origin;
            let baseurl = 'https://ssi.iviva.cloud';
            let execurl = `${baseurl}/api/${appurl}/DailySelectSystemAvailabilityAPI`;
            let parm = `&Year=${props.selectedYear}&SystemKey=${parseInt(props.Systemkey)}`
            axios.get(`${execurl}?apikey=${props.uxpContext?.apiKey}${parm}`)
            .then(response => {
                let res : any[] = response.data;
                OrganizeData(res,xaxisdata);
            })
            .catch(e => {
                console.log("except: ", e);
                setLastChartData([]);
                toast.error("Something went wrong");
            })
        }
    }
    // async function GetFromDB(xaxisdata:string[]){
    //     props.uxpContext?.executeAction("C2ODashboard", "GetHeatMapDayMapping", {YearIn:props.selectedYear,TimeZoneIn:props.TimeOffSet,Systemkey:parseInt(props.Systemkey)}, { json: true })
    //     .then(res => {
    //         console.log("resxxxxxxxxxxxxxx", res);
    //         OrganizeData(res,xaxisdata);
        
    //     })
    //         .catch(e => {
    //         console.log("except: ", e);
    //         setLastChartData([]);
    //         //setLoading(false);
    //         toast.error("Something went wrong");
    //     })
    // }
    

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
            height:670,
            width:1290
        },
        credits: {
            enabled: false
        },
        xAxis: [{
                categories:XaxisCategory,
                tickWidth: 0,
                // labels: {
                //     style: {
                //         fontSize: 9,
                //         fontFamily: "monospace",
                //         fontWeight:"bolder"
                //     }
                // },
                labels: {
                    useHTML: true,
                    formatter: function() {
                        return '<span class="HourViewNormal-hc-label-downx-Day">' + CheckTwonumber(this.value) + '</span>';
                    }
                },
                title: {
                    y:11,
                    text: 'Date',
                    style: {
                        fontSize: 10,
                        fontFamily: 'cambria',
                        fontWeight:'bolder'
                    }
                }
            },{
                
                linkedTo: 0,
                categories:XaxisCategory,
                tickWidth: 0,
                opposite: true,
                // labels: {
                //     style: {
                //         fontSize: 11,
                //         fontFamily: "monospace",
                //         fontWeight:"bolder"
                //     }
                // },
                labels: {
                    useHTML: true,
                    formatter: function() {
                        return '<span class="HourViewNormal-hc-label-upx-Day">' + CheckTwonumber(this.value) + '</span>';
                    }
                },
                title: {
                    y:-10,
                    text: 'Date',
                    style: {
                        y:-10,
                        fontSize: 11,
                        fontFamily: 'cambria',
                        fontWeight:'bolder'
                    }
                }
            },
        ],
        yAxis: 
            {
                categories:YaxisCategory,
                labels: {
                    style: {
                        fontSize: 10,
                        fontFamily: 'cambria',
                        fontWeight:'bolder'
                    }
                },
                reversed: true,
                title: {
                    text: 'Month',
                    style: {
                        fontSize: 11,
                        fontFamily: 'cambria',
                        fontWeight:'bolder'
                    }
                }
            }
        ,
        // tooltip: {
        //     formatter: function () {
        //         if(this.point.options.Infor !='None'){
        //             return '<b>' + props.selectedYear + '</b>-<b>' + this.point.options.Yvalue + '</b>-<b>' + this.point.options.Xvalue + '</b><br><b>' +
        //             this.point.options.Infor + '</b>  <br><b></b>';
        //         }
        //         else{
        //             return '<b>Not a Date</b>'
        //         }
        //     }
        // },
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
                return `<div style="background-color:white; padding:10px; border:1px solid ${this.color};"><b>${props.selectedYear}</b>-<b>${this.point.options.y+1}</b>-<b>${this.point.options.Xvalue}</b> <br><b>
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
                        //console.log(event.point.Infor,"event.point-event.point","None");
                        if(event.point.Infor != "None"){
                            setDetailsPopup(event.point.options);
                            setshowPopup(true);
                        }
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

    return(
        <div>
            <div style={{marginTop:"-5px",width:"100%"}}>
                <div style={{position:"relative",marginTop:"-5px",height:"680px"}}>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={optionsChart}
                    />
                </div>
            </div>
            <Modal
                show={ShowingFaultDetailPopup(showPopup,DetailsPopup)}
                onOpen={() => { }}
                onClose={() => setshowPopup(false)}
                title={`System Defects ( ${props.System} )`}
                styles={{}}
            >
                <DailyDetailPopup 
                    DetailOBJ={DetailsPopup}
                    System={props.Systemkey}
                    Location={props.Locationkey}
                    Year={props.selectedYear}
                    LocationName={props.Location}
                    TimeOffSet={props.TimeOffSet}
                    CurrencyType={props.CurrencyType}
                    uxpContext = {props.uxpContext}
                />
            </Modal>
        </div>
    )
}
export default SystemFailureHeatMapDay;
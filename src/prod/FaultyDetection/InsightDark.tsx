import * as React from 'react';
import './InsightDark.scss';
import { BASE_URL } from "../../common";
import {DropDownButton,useToast} from 'uxp/components';
import Highcharts, { Point } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HC_more from 'highcharts/highcharts-more';
HC_more(Highcharts);import HC_seriesLBL from 'highcharts/modules/series-label';
HC_seriesLBL(Highcharts);

import { IContextProvider } from '../../uxp';

interface IProps {
    TestInstantMapKey:string;
    AssetKey:string;
    TestName:string;
    FaultyDescription:string[];
    IsDefect:string;
    TimeOffset : number;
    uxpContext?: IContextProvider
}



const InsightPopup: React.FunctionComponent<IProps> = (props) => {

    const [FailedPrecentage, setFailedPrecentage] = React.useState(0);
    const [TotalCounting, setTotalCounting] = React.useState(0);
    const [NoticedTitle, setNoticedTitle] = React.useState('');
    const [NoticedTitleWidth, setNoticedTitleWidth] = React.useState('');
    const [MainFaultDecList, setMainFaultDecList] = React.useState(<tr><td></td></tr>);
    const [VeryficationSummary, setVeryficationSummary] = React.useState([]);
    const [ChartSeries, setChartSeries] = React.useState([]);
    const [YaxisList, setYaxisList] = React.useState([]);
    const [StacPassData, setStacPassData] = React.useState([]);
    const [StacFailData, setStacFailData] = React.useState([]);
    const [StacXaxis, setStacXaxis] = React.useState([]);
    const [RecTaskList,setRecTaskList]=React.useState([]);
    const [ChartColors, setChartColors] = React.useState(['#32a852','#219c9a','#aba99f','#282e9c','#962a72','#b06621','#742894','#a83238','#912762']);
    React.useEffect(() => {
        let mainDecList = MessagesList(props.FaultyDescription,'InsightPopup-faultdescriptionCell-description','95%');
        setMainFaultDecList(mainDecList);
        GetCyclingData();
        GetExternalData();
        if(props.IsDefect=='1'){
            setNoticedTitle('We noticed a defect');
            setNoticedTitleWidth('185px');
        }
        else{
            setNoticedTitle('We noticed a anomaly');
            setNoticedTitleWidth('210px');
        }
    }, [props]);

    function groupBy(objectArray : any[], property:string) {
        return objectArray.reduce(function (acc, obj) {
          var key = obj[property];
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(obj);
          return acc;
        }, {});
    }

    function formatDate(date:string) {
        let justgetdt= new Date(date);
        var d = new Date(justgetdt.getTime() + ((props.TimeOffset+justgetdt.getTimezoneOffset())*60000)),
        //var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('/');
    }

    function formatTime(date:string) {
        let justgetdt= new Date(date);
        var d = new Date(justgetdt.getTime() + ((props.TimeOffset+justgetdt.getTimezoneOffset())*60000)),
        //var d = new Date(date),
            hour = '' + d.getHours(),
            minute = '' + d.getMinutes(),
            second =''+ d.getSeconds();
    
        if (hour.length < 2) 
            hour = '0' + hour;
        if (minute.length < 2) 
            minute = '0' + minute;
        if (second.length < 2) 
            second = '0' + second;
    
        return [hour, minute, second].join(':');
    }

    function MessagesList(messageList:any[],iconoflist:string,widthOfcell:string){
        var messages: any
        if (messageList.length>0) {
            messages = (messageList.map((message, i) => (
               <tr><td style={{width:"10px",verticalAlign:"top",paddingTop:"10px"}}><div style={{marginTop:"2px"}}><div className={iconoflist}></div></div></td><td style={{width:widthOfcell,paddingTop:"10px"}}><span style={{fontSize:"12px",fontWeight:"bold"}}>{message}</span></td></tr> )
            ));
        }
        else{
            messages = <td></td>
        }
        return(messages);
    }

    async function DesignChartData(GotData : any[]){
        let seriesofchart =[];
        let pobarray : any[];
        let yaxisofchart =[];

        let Parameters = [...new Set(GotData.map(item => item.ParameterName))];
        let unitlist = [...new Set(GotData.map(item => item.ParameterValue))];

        for(let j=0; j<unitlist.length;j++){
            let yaxisC={
                opposite: j==0?false:true,
                //max: 60 ,
                //min: 0 ,
                //lineWidth:1,
                lineColor:ChartColors[j],
                gridLineWidth: 0,
                minorGridLineWidth:0,
                //tickInterval: 10,
                labels: {
                    //x:-5,
                    format: `{value}${unitlist[j]}`,
                    style: {
                        fontSize: 10,
                        color: ChartColors[j]
                    }
                },
                title: {
                    text:''
                    // text: `${pname} ( % )`,
                    // style: {
                    //     fontSize: 10,
                    //     color: ChartColors[i]
                    // }
                }
            };
            yaxisofchart.push(yaxisC);
        }

        
        var groupedParameter = groupBy(GotData, 'ParameterName');

        for(let i=0; i<Parameters.length;i++){
            let pname=Parameters[i];
            pobarray = groupedParameter[`${pname}`];
            let unitname = pobarray[0][`ParameterValue`];

            var yaxisindex = unitlist.indexOf(`${unitname}`);
            var chartdata = await (pobarray.map((category, i) => {
                //let yValue= (Math.round(parseFloat(category.TestValue)*100)/100).toString();
                return({
                    x:parseInt(category.CycleKey),
                    y:parseFloat(category.TestValue)
                });
            }));

            let seriename = '';
            if(unitname==''){
                seriename= `${pname}`;
            }
            else{
                seriename= `${pname}(${unitname})`;
            }
            seriesofchart.push({
                name:seriename,
                color: ChartColors[i],
                data:chartdata,
                yAxis: yaxisindex,
                type:'spline',
            });
        }
        setYaxisList(yaxisofchart);
        setChartSeries(seriesofchart);
    }

    const optionsCircularChart = {
        chart:{
            backgroundColor: '#1D1D1D',
            type:'pie',
            height: 180,
            width:180
        },
        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        subtitle: {
            text: `<div style='border-radius:100px;position:absolute;left:-55px;top:-41px;width:110px;height:110px;font-size: 14px;background-color:#ff9b80; color:#cc0000;font-weight:bolder;'><div style='padding-top:36px;'><span style='font-size:20px'>${(Math.round(FailedPrecentage*100)/100).toString()}</span><span>%</span></br><span>Failed</span><div></div>`,
            align: "center",
            verticalAlign: "middle",
            style: {
              "textAlign": "center"
            },
            x: 0,
            y: -2,
            useHTML: true
        },
        series: [{
            type: 'pie',
            enableMouseTracking: false,
            innerSize: '80%',
            dataLabels: {
              enabled: false
            },
            data: [{
              y: FailedPrecentage,
              color: '#cc0000'
            }, {
              y: (100-FailedPrecentage),
              color: '#BBFFA1'
            }]
        }]
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
            backgroundColor:"#171717",
            type:'spline',
            height: 300,
            zoomType: 'xy',
            width:760
        },
        credits: {
            enabled: false
        },
        xAxis: {
            max:TotalCounting,
            min: 1,
            tickInterval:1,
            labels: {
                style: {
                    fontSize: 9
                }
            },
            title: {
                text: `Cycle`,
                style: {
                    fontSize: 8,
                    marginTop:-20
                }
            }
        },
        tooltip: {
            headerFormat: '<b>Cycle - {point.x}</b><br/>',
            pointFormat: '{series.name}: {point.y}<br/>'
        },
        yAxis:YaxisList,
        legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            maxHeight: 60,
            y:26,
            x:0,
            floating: true,
            enabled:true,
            symbolHeight: 12,
            symbolWidth: 12,
            symbolRadius: 6,
            itemMarginBottom: 5,
            itemStyle: {
                fontSize:'11px',
                color:"white",
                fontWeight:"normal"
            }

        },
        series: ChartSeries
    }

    async function CreateSummaryList(GotData:any[]){
        let cycleList = [...new Set(GotData.map(item => item.CycleKey))];
        var summaryList = groupBy(GotData, 'CycleKey');
        var SummaryItemList = [];
        var cycleIds =[];
        var failcount = 0;
        var totalcount = 0;
        for(let k=0; k<cycleList.length ; k++){
            var item = summaryList[`${cycleList[k]}`][0];
            var eachCycle :any[];
            eachCycle = summaryList[`${cycleList[k]}`];
            if(item.Status == 'Test Failed'){
                failcount=failcount+1;
            }
            totalcount=totalcount+1;
            var divname = `Cycle-${item.CycleKey.length <2 ? ('0'+item.CycleKey):item.CycleKey}`;
            cycleIds.push(divname);
            var summaryitem=(        
                    <tr>
                        <td  style={{paddingTop:"10px"}}>
                            <div className="InsightPopup-faultdescriptionCell-description"></div>
                        </td>
                        <td  style={{paddingTop:"10px"}}>
                            <div>
                                {divname}
                            </div>
                        </td>
                        <td  style={{paddingTop:"10px"}}>
                            <div>
                                {`${formatDate(item.WorkFlowStartTime)}  ${formatTime(item.WorkFlowStartTime)}`}
                            </div>
                        </td>
                        <td  style={{paddingTop:"10px",paddingLeft:"10px"}}>
                            <div className="InsightPopup-SummaryCycleList-iconContainer">
                                <div className={`InsightPopup-SummaryCycleList-${item.Status=='Test Failed'? 'FailIcon':'correctIcon'}`}></div>
                            </div>
                        </td>
                        <td  style={{paddingTop:"10px"}}>
                            <div>
                                {item.Status=='Test Failed'? 'Failed':'Successful'}
                            </div>
                        </td>
                        <td  style={{paddingTop:"10px",paddingLeft:"30px"}}>
                            <div className="InsightPopup-SummaryCycleList-iconContainer">
                                <div data-value={divname} className={`InsightPopup-SummaryCycleList-downIcon`}
                                    onClick={(event) => {
                                        var expdiv= event.currentTarget.getAttribute('data-value');
                                        var iconclasslist =  event.currentTarget.classList;
                                        expandingDiv(expdiv,iconclasslist);
                                    }}
                                ></div>
                            </div>
                        </td>
                    </tr>
            );

            var summarydetails=(
                <tr>
                   <td colSpan={7}>
                       <div id={divname} className="InsightPopup-SummaryCycleList-expander" style={{borderRadius:"5px",backgroundColor:`${item.Status=='Test Failed'? '#000000':'#000000'}`}}>
                            <table style={{width:"100%"}}>
                                <thead>
                                    <th>
                                        <div style={{width:"100%",textAlign:"left"}}>Parameter Name</div>
                                    </th>
                                    <th style={{width:'50px',paddingLeft:"5px"}}>
                                        Test Value
                                    </th>
                                    <th style={{width:'40px',paddingLeft:"5px"}}>
                                        Unit
                                    </th>
                                    <th style={{width:'50px',paddingLeft:"5px"}}>
                                        Lower Limit
                                    </th>
                                    <th style={{width:'50px',paddingLeft:"5px"}}>
                                        Upper Limit
                                    </th>
                                </thead>
                                <tbody>
                                {eachCycle.map((echparam,pi)=>{
                                    var coloroftext = 'black';
                                    if(echparam.IsProblematic == '0'){
                                        coloroftext = '#17990b';
                                    }
                                    else{
                                        coloroftext = '#e00000';
                                    }
                                    
                                    return(
                                        <tr>
                                            <td>
                                                <div style={{color:coloroftext}}>{echparam.ParameterName}</div>
                                            </td>
                                            <td style={{color:coloroftext,width:'50px',paddingLeft:"5px",textAlign:"center"}}>
                                                <DropDownButton 
                                                    position="right" 
                                                    showOnHover={true}
                                                    className = "InsightPopup-CycleSummaryList-dropdown"
                                                    content={() => 
                                                        <div style={{overflowY:"auto",maxHeight:"300px",width:"270px"}}>
                                                            <table><tbody>
                                                                {/* <tr><td><span style={{fontWeight:"bolder",color:"#6005a6"}}>Unit: </span>{echparam.ParameterValue}</td></tr> */}
                                                                <tr><td><span style={{fontWeight:"bolder",color:"#6005a6"}}>Result Description: </span>{echparam.ResultDescription}</td></tr>
                                                            </tbody></table>
                                                        </div>
                                                    } 
                                                >
                                                    <div style={{width:"100%",color:coloroftext,cursor:"help"}}>{echparam.TestValue}</div>
                                                </DropDownButton>
                                            </td>
                                            <td style={{width:'40px',paddingLeft:"5px",textAlign:"center"}}>
                                                <div style={{color:coloroftext}}>{echparam.ParameterValue}</div>
                                            </td>
                                            <td style={{width:'50px',paddingLeft:"5px",textAlign:"center"}}>
                                                <div style={{color:coloroftext}}>{echparam.LowerLimitValue}</div>
                                            </td>
                                            <td style={{width:'50px',paddingLeft:"5px",textAlign:"center"}}>
                                                <div style={{color:coloroftext}}>{echparam.UpperLimitValue}</div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody></table>
                       </div>
                   </td>
                </tr>
            );
            SummaryItemList.push(summaryitem);
            SummaryItemList.push(summarydetails);
        }
        var precentage= (failcount/totalcount)*100;
        setFailedPrecentage(precentage);
        setTotalCounting(totalcount);
        setVeryficationSummary(SummaryItemList);

        cycleIds.map((cyid, q) => {
            if(document.getElementById(cyid)){
                document.getElementById(cyid).style.display = "none";
            }
        });
    }

    function expandingDiv(divid :string,classList:any){
        console.log(divid,"divid");
        if(document.getElementById(divid).style.display == "none"){
            classList.remove('InsightPopup-SummaryCycleList-downIcon');
            document.getElementById(divid).style.display = "block";
            classList.add('InsightPopup-SummaryCycleList-upIcon');
        }
        else{
            classList.remove('InsightPopup-SummaryCycleList-upIcon');
            document.getElementById(divid).style.display = "none";
            classList.add('InsightPopup-SummaryCycleList-downIcon');
        }
        
    }

    let toast = useToast();
    async function GetCyclingData(){
        props.uxpContext?.executeAction("CMATUXPWidgets", "SOPTestCycleDetails", {TestInstanceMapKey:props.TestInstantMapKey}, { json: true })
        .then(res => {
            DesignChartData(res);
            CreateSummaryList(res);
        
        })
            .catch(e => {
            console.log("except: ", e);
            DesignChartData([]);
            CreateSummaryList([]);
            //setLoading(false);
            toast.error("Something went wrong");
        })
    }
    async function DesignStacChart(GotStacData:any[]){
        var faildata:any[];
        var passdata:any[];
        var Xaxisofstac:any[];
        Xaxisofstac=[];
        faildata=[];
        passdata=[];
        var stacdata =await GotStacData.map((stacitem, q) => {
            faildata.push(parseFloat(stacitem.FailedCount)*100/parseFloat(stacitem.TotalRun));
            passdata.push(parseFloat(stacitem.SucessCount)*100/parseFloat(stacitem.TotalRun));
            Xaxisofstac.push(`${stacitem.Year}-${stacitem.Month.length<2?('0'+stacitem.Month):stacitem.Month}`);
        });
        setStacXaxis(Xaxisofstac);
        setStacFailData(faildata);
        setStacPassData(passdata);
    }
    async function DesignRecomendation(GotTasks:any[]) {
        var tasks:any[]= [];
        var taskdata =await GotTasks.map((taskitem, q) => {
           return(
                <div className="InsightPopup-Recomendations-textcontainer">
                    {taskitem}
                    <div className="InsightPopup-Recomendations-listiconcontainer">
                        <div className="InsightPopup-faultdescriptionCell-description"></div>
                    </div>
                </div>
           );
        });
        setRecTaskList(taskdata);
    }
    async function GetExternalData(){

        props.uxpContext?.executeAction("CMATUXPWidgets", "GetCycleInsightData", {TestInstanceMapKey:props.TestInstantMapKey,TimeZone:props.TimeOffset,AssetKey:props.AssetKey}, { json: true })
        .then(res => {
            DesignStacChart(res.HistoricalChart);
            let TaskMessage: string[] = [];
            if (res['TaskDetails'].length>0){
                TaskMessage= res['TaskDetails'][0].Task.split(',');
            }
            DesignRecomendation(TaskMessage);
        
        })
            .catch(e => {
            console.log("except: ", e);
            DesignStacChart([]);
            DesignRecomendation([]);
            toast.error("Something went wrong");
        })
    }

    

    const optionsStacChart = {
        chart: {
            type: 'column',
            height:300,
            backgroundColor:"#171717"
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: StacXaxis
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Precentage ( % )'
            },
            stackLabels: {
                enabled: false
            },
            labels: {
                formatter: function() {
                    return(this.value+'%')
                }
            }
        },
        legend: {
            align: 'right',
            x: -30,
            verticalAlign: 'top',
            y: 0,
            floating: true,
            backgroundColor:
                Highcharts.defaultOptions.legend.backgroundColor || 'Black',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false,
            itemStyle: {
                fontSize:'11px',
                color:"white",
                fontWeight:"normal"
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: '{series.name}: {point.y:.2f}%<br/>'
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    format:'{y:.2f}%',
                    style:{
                        color:"black",
                        fontSize:10,
                        textOutline: 0,
                        borderWidth: 0,
                        textShadow: false
                    }
                }
            }
        },
        series: [ {
            name: 'Test Successful',
            data: StacPassData,
            color:'#61d95b'
        },{
            name: 'Test Failed',
            data: StacFailData,
            color:'#fc6c44'
        }]
    }

    return (
        <div className="InsightPopup">
            <div className="InsightPopup-ColumnDevide" style={{width:"100%"}}>
                <div className="InsightPopup-Column" style={{width:"45%"}}>
                    <div className="InsightPopup-DetailContainer">
                        <div className="InsightPopup-MainIcon-container">
                            <div className="InsightPopup-MainIcon"></div>
                        </div>
                        <div className="WeNoticed-style" style={{width:NoticedTitleWidth}}>
                                {NoticedTitle}
                                <div className="WeNoticed-icon-container">
                                    <div className="WeNoticed-icon"></div>
                                </div>
                        </div>
                        <div className="InsightPopup-MainDec-container">
                            <div className="InsightPopup-MainDec">
                                <div className="InsightPopup-MainDec-text">
                                    {props.TestName}
                                </div>
                            </div>
                        </div>
                        <div className="InsightPopup-MainDecList-container">
                            <table style={{width:"100%"}}><tbody>
                                {MainFaultDecList}
                            </tbody></table>
                        </div>
                        <div className="InsightPopup-SummaryCycle-Title">
                            <div className="InsightPopup-SummaryCycle-Title-Text">
                                VERIFICATION SUMMARY
                                <mark className="InsightPopup-headcountjobnotify" style={{visibility:"visible",width:'15px'}}>
                                    {TotalCounting}
                                </mark>
                            </div>
                        </div>
                        <div className="InsightPopup-SummaryCycle">
                            <div className="InsightPopup-ColumnDevide" style={{width:"100%"}}>
                                <div className="InsightPopup-Column" style={{width:"70%"}}>
                                    <div className="InsightPopup-SummaryCycleList">
                                        <table style={{width:"100%"}}><tbody>
                                            {VeryficationSummary.map((row, rowid) => {
                                                return(row);
                                            })}
                                        </tbody></table>
                                    </div>
                                </div>
                                <div className="InsightPopup-Column" style={{width:"30%"}}>
                                    <div className="InsightPopup-SummaryChart">
                                            <div className="InsightPopup-SummaryChart-Container">
                                                <HighchartsReact
                                                    highcharts={Highcharts}
                                                    options={optionsCircularChart}
                                                />
                                            </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="Recomendation-style" style={{color:"#52C9A9"}}>
                            Recomendations
                            <div className="Recomendation-icon-container">
                                <div className="Recomendation-icon"></div>
                            </div>
                        </div>
                        <div className="InsightPopup-Recomendations-container">
                            {RecTaskList}      
                        </div>
                    </div>
                </div>
                <div className="InsightPopup-Column" style={{width:"55%"}}>
                    <div className="InsightPopup-BlockContainer">
                        <div className="InsightPopup-BlockContainer-title">ILLUSTRATION OF ANALYTICS</div>
                        <div style={{borderRadius:"5px",backgroundColor:"#171717",boxShadow: "0px 3px 6px #00000029",paddingLeft:"20px",paddingRight:"20px",paddingTop: "20px"}}>
                            <div className="InsightPopup-BlockContainer-subtitle">Parameter Trends</div>
                            <div className="InsightPopup-ChartContainer">
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={optionsChart}
                                />
                            </div>
                            <div className="InsightPopup-BlockContainer-subtitle" style={{marginTop:"20px"}}>Historical Information</div>
                            <div className="InsightPopup-ChartContainer">
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={optionsStacChart}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InsightPopup;
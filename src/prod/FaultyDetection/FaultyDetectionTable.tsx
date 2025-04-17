import * as React from 'react';
import {DataTable,DropDownButton,useToast} from 'uxp/components';
import './FaultyDetectionTable.scss';
import {BASE_URL} from "../../common";
import { LinkWidgetContainer} from "uxp/components";
import Insight from './InsightDark';
import { IContextProvider } from '../../uxp';
import axios, {AxiosResponse} from 'axios';


interface IProps {
    FaultyDataSet:any[];
    CurrencyType:string;
    Offset:string;
    TableHeight:string;
    RSProcess:string;
    LocationKey:string;
    uxpContext?: IContextProvider
}

interface BodyData {
    EquipmentID:JSX.Element,
    ServingLocations:JSX.Element,
    FaultDetected:JSX.Element,
    CostOfFailure:JSX.Element,
    RiskImpactValue:JSX.Element,
    Process:JSX.Element,
    WorkOrder:JSX.Element
}

const FaultyDetectionTable: React.FunctionComponent<IProps> = (props) => {

    const [showInsight, setshowInsight] = React.useState(false);
    const [TestInstantMapKey, setTestInstantMapKey] = React.useState('');
    const [AssetKey, setAssetKey] = React.useState('');
    const [AssetID, setAssetID] = React.useState('');
    const [FaultyDescriptions, setFaultyDescriptions] = React.useState([]);
    const [TestName, setTestName] = React.useState('');
    const [IsDefect, setIsDefect] = React.useState('');

    const [TableData, setTableData] = React.useState([]);
    const [TotalSaving, setTotalSaving] = React.useState('');
    const [TableHeight, setTableHeight] = React.useState('400px');

    const equpmentLegend = (<div>
                                <div style={{height: '30px' }}>
                                    <div style={{ textAlign: 'left', float: 'left', height: '15px', borderBottomWidth: 'thin', lineHeight: '17px', borderColor: 'gray', fontSize: '10px', fontFamily: 'Comfortaa' }}>Rectification Types</div> 
                                </div>
                                <div>
                                    <table><tbody>
                                        <tr>
                                            <td>
                                                <div >
                                                    <div className='faultdetectionTable-equipmentcell-anomalyicon'></div>
                                                </div>
                                            </td> 
                                            <td  style={{ paddingLeft: "10px" }}>
                                               Anomaly
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div>
                                                    <div className='faultdetectionTable-equipmentcell-defecticon'></div>
                                                </div>
                                            </td> 
                                            <td  style={{ paddingLeft: "10px" }}>
                                               Defect 
                                            </td>
                                        </tr>
                                    </tbody></table>
                                </div>
                            </div>);

    const rescitificationtype = (<div>
                                    <div style={{height: '30px' }}>
                                        <div style={{ textAlign: 'left', float: 'left', height: '15px', borderBottomWidth: 'thin', lineHeight: '17px', borderColor: 'gray', fontSize: '10px', fontFamily: 'Comfortaa' }}>Rectification Types</div> 
                                    </div>
                                    <div>
                                        <table><tbody>
                                            <tr>
                                                <td>
                                                    <div>
                                                        <div className='faultdetectionTable-faultdescriptioncell-experticon'></div>
                                                    </div>
                                                </td> 
                                                <td style={{ paddingLeft: "10px" }}>
                                                    Expert Input
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div>
                                                        <div className='faultdetectionTable-faultdescriptioncell-automatedicon'></div>
                                                    </div>
                                                </td> 
                                                <td style={{ paddingLeft: "10px" }}>
                                                    Automated 
                                                </td>
                                            </tr>
                                        </tbody></table>
                                    </div>
                                </div>);

    const RiskRangeLegend = (<div className="faultdetectionTable-LegendInformation"><div className="faultdetectionTable-RiskImapactValue"><div className="RiskImpactLegend">
                                <div style={{ width: '180px', height: '30px' }}>
                                    <table style={{ width: '100%' }}><tbody><tr>
                                        <td style={{ borderBottom: "1px solid black", paddingBottom: "10px" }}>
                                            <div style={{ textAlign: 'left', float: 'left', height: '15px', borderBottomWidth: 'thin', lineHeight: '17px', borderColor: 'gray', fontSize: '10px', fontFamily: 'Comfortaa' }}>Risk Impact Value</div>
                                        </td>
                                        <td style={{ borderBottom: "1px solid black", paddingBottom: "10px" }}>
                                            
                                        </td>
                                    </tr></tbody></table>
                                </div>
                                <div style={{ width: '180px' }}>
                                    <table style={{ width: '100%' }}><tbody>
                                        <tr>
                                            <td style={{ width: "20px", borderBottom: "1px solid black" }}>
                                                <div style={{ position: "relative" }}>
                                                    <div className="RiskImapactValue-redupcirclearrow">
                                                        <div style={{background:"#f76841",width:"12px",height:"12px",position:"absolute",left:"2px",top:"2px",borderRadius:"50%"}}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ borderBottom: "1px solid black", paddingBottom: "5px" }}>
                                                <div className="RiskImapactValue-ValuBox" style={{ float: "left", fontSize: "12px", backgroundColor: "transparent", textAlign: "left" }}>High</div>
                                            </td>
                                            <td style={{ width: "35px", borderBottom: "1px solid black", paddingBottom: "5px" }}>
                                                <div className="RiskImapactValue-ValuBox">600</div>
                                            </td>
                                            <td style={{ width: "5px", borderBottom: "1px solid black", paddingBottom: "5px" }}>
                                                <div className="RiskImapactValue-ValuBox" style={{ width: "5px", backgroundColor: "transparent" }}>-</div>
                                            </td>
                                            <td style={{ width: "35px", borderBottom: "1px solid black", paddingBottom: "5px" }}>
                                                <div className="RiskImapactValue-ValuBox">1000</div>
                                            </td>

                                        </tr>
                                        <tr>
                                            <td style={{ width: "20px", borderBottom: "1px solid black" }}>
                                                <div style={{ position: "relative" }}>
                                                    <div className="RiskImapactValue-orangerightcirclearrow">
                                                        <div style={{background:"#feb357",width:"12px",height:"12px",position:"absolute",left:"2px",top:"2px",borderRadius:"50%"}}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ borderBottom: "1px solid black", paddingBottom: "5px" }}>
                                                <div className="RiskImapactValue-ValuBox" style={{ float: "left", fontSize: "12px", backgroundColor: "transparent", textAlign: "left" }}>Medium</div>
                                            </td>
                                            <td style={{ width: "35px", borderBottom: "1px solid black", paddingBottom: "5px" }}>
                                                <div className="RiskImapactValue-ValuBox">300</div>
                                            </td>
                                            <td style={{ width: "5px", borderBottom: "1px solid black", paddingBottom: "5px" }}>
                                                <div className="RiskImapactValue-ValuBox" style={{ width: "5px", backgroundColor: "transparent" }}>-</div>
                                            </td>
                                            <td style={{ width: "35px", borderBottom: "1px solid black", paddingBottom: "5px" }}>
                                                <div className="RiskImapactValue-ValuBox">600</div>
                                            </td>

                                        </tr>
                                        <tr>
                                            <td style={{ width: "20px" }}>
                                                <div style={{ position: "relative" }}>
                                                    <div className="RiskImapactValue-greendowncirclearrow">
                                                        <div style={{background:"#ffd5b9",width:"12px",height:"12px",position:"absolute",left:"2px",top:"4px",borderRadius:"50%"}}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td >
                                                <div className="RiskImapactValue-ValuBox" style={{ float: "left", fontSize: "12px", backgroundColor: "transparent", textAlign: "left" }}>Low</div>
                                            </td>
                                            <td style={{ width: "35px" }}>
                                                <div className="RiskImapactValue-ValuBox">300</div>
                                            </td>
                                            <td style={{ width: "5px" }}>
                                                <div className="RiskImapactValue-ValuBox" style={{ width: "5px", backgroundColor: "transparent" }}>-</div>
                                            </td>
                                            <td style={{ width: "35px" }}>
                                                <div className="RiskImapactValue-ValuBox">0</div>
                                            </td>

                                        </tr>
                                    </tbody></table>
                                </div>
                            </div></div></div>);

    React.useEffect(() => {
        DesignColumnData();
    }, [props.FaultyDataSet,props.TableHeight,props.RSProcess,props.CurrencyType]);

    function MessagesList(messageList:any[],iconoflist:string,widthOfcell:string){
        var messages: any
        if (messageList.length>0) {
            messages = (messageList.map((message, i) => (
               <tr><td style={{width:"10px",verticalAlign:"top"}}><div style={{marginTop:"5px"}}><div className={iconoflist}></div></div></td><td style={{width:widthOfcell}}><span style={{fontSize:"10px"}}>{message}</span></td></tr> )
            ));
        }
        else{
            messages = <td></td>
        }
        return(messages);
    }

    async function DesignColumnData(){
        var bodyfinaldata: BodyData[] = null;
        let totalcost=0;
        bodyfinaldata = await props.FaultyDataSet.map((obj, i) => {
            var equipmentclassicon = 'equipmentcell-defecticon'
            if (obj['FaultBehaviour'] == 'Anomaly') {
                equipmentclassicon = 'equipmentcell-anomalyicon'
            }
            else{
                equipmentclassicon = 'equipmentcell-defecticon';
            }
            let equipid = obj['AssetID'] ;
            if( obj['AssetID'].length > 19){
                equipid = `${obj['AssetID'].substr(0, 16)}...`
            }
            else{
                equipid = obj['AssetID']
            }
            let column1 = (<div className="faultdetectionTable-equipmentcell" title={obj['AssetID']}>
                                <div className="equipmentcell-iconPositioning">
                                    <div className={equipmentclassicon}></div>
                                </div>
                                <div className="equipmentcell-textContainer">{equipid}</div>
                                <div className="equipmentcell-DateContainer" title="WorkFlow Start Time">{obj['WorkFlowStartTime']}</div>
                            </div>);

            let ServingLocationsA : string[] = obj['ServingLocations'].split(',');
            if(ServingLocationsA.length>0){
                ServingLocationsA= ServingLocationsA.map((slname, sli) => {
                    var cropslname = slname.substring(slname.indexOf('.') + 1);
                    return cropslname;
                });
            }
            let UniqServingLocationsA = Array.from(new Set(ServingLocationsA));
            let ServingLocationsList=MessagesList(UniqServingLocationsA,"faultdetectionTable-servinglocationcell-locationicon","120px");
            let column2 = (<div className="faultdetectionTable-servinglocationcell">
                            <DropDownButton 
                                position="right" 
                                showOnHover={true}
                                className = "faultdetectionTable-faultdescriptioncell-dropdown"
                                content={() => 
                                    <div style={{overflowY:"auto",maxHeight:"500px"}}>
                                        <table><tbody>
                                            {ServingLocationsList}
                                        </tbody></table>
                                    </div>
                                } 
                            >
                                <div className="servinglocationcell-textcontainer">
                                    {UniqServingLocationsA.join(', ')}
                                </div>
                            </DropDownButton>
                        </div>);

            let FaultMessage: string[] = obj['FaultDescription'].split(',');
            let UniqFaultMessage = Array.from(new Set(FaultMessage));
            let faultymessages=MessagesList(UniqFaultMessage,"faultdetectionTable-faultdescriptioncell-doticon","160px");
            let rectficationicon='';
            if (obj['RectificationType'] == 'Expert Input') {
                rectficationicon = 'faultdetectionTable-faultdescriptioncell-experticon'
            }
            else if (obj['RectificationType'] == 'Automated') {
                rectficationicon = 'faultdetectionTable-faultdescriptioncell-automatedicon'
            }
            
           
            var insightdiv = <div></div>;
            if(obj["HasCycle"]){
                if(obj["HasCycle"]=='1'){
                    insightdiv=(<div className="faultdetectionTable-Column" style={{width:"13%",visibility:'visible',paddingLeft:'7px'}}>
                            <div className="faultdetectionTable-faultdescriptioncell-insight">
                                <div className="faultdescriptioncell-insighticon-container">
                                    <div className="faultdescriptioncell-insighticon"
                                        onClick={() => {
                                            setshowInsight(true);
                                            setTestInstantMapKey(obj["TestInstanceMapKey"]);
                                            setAssetKey(obj["AssetKey"]);
                                            setAssetID(obj["AssetID"]);
                                            setFaultyDescriptions(UniqFaultMessage);
                                            setTestName(obj["TestName"]);
                                            if(obj['FaultBehaviour'] == 'Anomaly'){
                                                setIsDefect('0');
                                            }
                                            else{
                                                setIsDefect('1');
                                            }
                                        }}
                                    >
                                    </div>
                                </div>
                            </div>
                        </div>)
                }
                else{
                    insightdiv=(<div className="faultdetectionTable-Column" style={{width:"13%",visibility:'hidden'}}></div>)
                }
            }
           
            let column3 = (
                            <div className="faultdetectionTable-faultdescriptioncell-Container">
                                <div className="faultdetectionTable-ColumnDevide" style={{width:"100%"}}>
                                    <div className="faultdetectionTable-Column" style={{width:"87%"}}>
                                        <div className="faultdetectionTable-faultdescriptioncell">
                                            <div className="faultdetectionTable-ColumnDevide">
                                                <div className="faultdetectionTable-Column" style={{width:"10%"}}>
                                                    <div style={{paddingLeft:"5px"}}>
                                                        <div className={rectficationicon}></div>
                                                    </div>
                                                </div>
                                                <div className="faultdetectionTable-Column" style={{width:"90%"}}>
                                                    <DropDownButton 
                                                        position="right" 
                                                        showOnHover={true}
                                                        className = "faultdetectionTable-faultdescriptioncell-dropdown"
                                                        content={() => 
                                                            <div style={{overflowY:"auto",maxHeight:"500px"}}>
                                                                <table><tbody>
                                                                {faultymessages}
                                                                </tbody></table>
                                                            </div>
                                                        } 
                                                    >
                                                        <div className="faultdescriptioncell-textcontainer">
                                                            {UniqFaultMessage.join(', ')}
                                                        </div>
                                                    </DropDownButton>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {insightdiv}
                                </div>
                            </div>

                        );
        
            let costoffail = parseFloat(obj['WastageCost']?obj['WastageCost']:obj['WastsgeCost'])+parseFloat(obj['EnergyCost'])+parseFloat(obj['MaterialCost']?obj['MaterialCost']:obj['MaterialsCost'])+parseFloat(obj['ManpowerCost']);
            let costpop= (<div>
                <table><tbody>
                    <tr className="border_bottom">
                        <td colSpan={2}>
                            <div className="faultdetectionTable-costcell-infoTopic" style={{width:"140px"}}>Cost Of Failure</div>
                        </td>
                        <td></td>
                    </tr>
                    <tr>
                        <td style={{paddingTop:"10px"}}>
                            <div className="faultdetectionTable-costcell-infoCategory">Energy Wastage</div>
                        </td>
                        <td style={{paddingTop:"10px"}}>
                            <div className="faultdetectionTable-costcell-infoValue">{`${props.CurrencyType} `} {(Math.round(parseFloat(obj['WastageCost']?obj['WastageCost']:obj['WastsgeCost'])*100)/100).toString()}</div>
                        </td>
                        <td style={{paddingTop:"10px"}}>
                            <div className="faultdetectionTable-costcell-infoValue">{(Math.round(parseFloat(obj['CumulativeValue'])*100)/100).toString()} kWh</div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <div className="faultdetectionTable-costcell-infoTopic" style={{width:"140px"}}>Issue Rectification</div>
                        </td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>
                            <div className="faultdetectionTable-costcell-infoCategory">Energy</div>
                        </td>
                        <td>
                            <div className="faultdetectionTable-costcell-infoValue">{`${props.CurrencyType} `} {(Math.round(parseFloat(obj['EnergyCost'])*100)/100).toString()}</div>
                        </td>
                        <td>
                            <div className="faultdetectionTable-costcell-infoValue">{(Math.round(parseFloat(obj['Energy'])*100)/100).toString()} kWh</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className="faultdetectionTable-costcell-infoCategory">Manpower</div>
                        </td>
                        <td>
                            <div className="faultdetectionTable-costcell-infoValue">{`${props.CurrencyType} `} {(Math.round(parseFloat(obj['ManpowerCost'])*100)/100).toString()}</div>
                        </td>
                        <td>
                            <div className="faultdetectionTable-costcell-infoValue">{(Math.round(parseFloat(obj['ManHours'])*100)/100).toString()} Hrs</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className="faultdetectionTable-costcell-infoCategory">Material</div>
                        </td>
                        <td>
                            <div className="faultdetectionTable-costcell-infoValue">{`${props.CurrencyType} `} {(Math.round(parseFloat(obj['MaterialCost']?obj['MaterialCost']:obj['MaterialsCost'])*100)/100).toString()}</div>
                        </td>
                        <td></td>
                    </tr>
                    <tr>
                        <td style={{paddingTop:"5px"}}>
                            <div className="faultdetectionTable-costcell-infoTopic" style={{height:"24px"}}>Total</div>
                        </td>
                        <td colSpan={2} style={{paddingTop:"5px"}}>
                            <div className="faultdetectionTable-costcell-infoValue" style={{fontSize:"12px",fontWeight:"bolder",backgroundColor:"#e3e7ff",height:"24px"}}>{`${props.CurrencyType}`} {(Math.round(costoffail*100)/100).toString()}</div>
                        </td>
                    </tr>
                </tbody></table>
            </div>);
            let column4 =(
                <div className="faultdetectionTable-costcell">
                    <div className="costcell-textContainer">{(Math.round(costoffail*100)/100).toString()}</div> 
                    <div className="costcell-iconposition">
                        <DropDownButton 
                            className="fauldetiontable-costing-dropdown"
                            position="right" 
                            content={() => <div>{costpop}</div>} >
                            <div className="costcell-infoicon"></div>
                        </DropDownButton>
                    </div>
                </div>
            );

            let riskbackcolor='';
            let riskfontcolor='';
            if(parseFloat(obj['RiskImpactValue'])>600){
                // riskbackcolor='#C20000';
                // riskfontcolor='white';
                riskbackcolor='#f76841';
                riskfontcolor='#404040';
            }
            else if(parseFloat(obj['RiskImpactValue'])<300){
                // riskbackcolor='#F7C23B';
                // riskfontcolor='#0C0A3B';
                riskbackcolor='#ffd5b9';
                riskfontcolor='#404040';
            }
            else{
                // riskbackcolor='#CC6606';
                // riskfontcolor='white';
                riskbackcolor='#feb357';
                riskfontcolor='#404040';
            }
            let column5 = (
                <DropDownButton 
                    className="fauldetiontable-riskimpactValue-dropdown"
                    position="right" 
                    content={() => 
                            <div>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <div className="fauldetiontable-riskimpactValue-dropdown-detail-text">Probability</div>
                                            </td>
                                            <td>
                                                <div className="fauldetiontable-riskimpactValue-dropdown-detail-value">{obj['ProbabilityRank']}</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="fauldetiontable-riskimpactValue-dropdown-detail-text">Severity</div>
                                            </td>
                                            <td>
                                                <div className="fauldetiontable-riskimpactValue-dropdown-detail-value">{obj['SeverityRank']}</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="fauldetiontable-riskimpactValue-dropdown-detail-text">Detectability</div> 
                                            </td>
                                            <td>
                                                <div className="fauldetiontable-riskimpactValue-dropdown-detail-value">{obj['Detectability']}</div>
                                            </td>
                                        </tr>
                                        <tr style={{color:riskbackcolor}}>
                                            <td>
                                                <div style={{fontSize:"13px",fontWeight:"bolder"}} className="fauldetiontable-riskimpactValue-dropdown-detail-text">Risk Impact Value</div>
                                            </td>
                                            <td>
                                                <div style={{fontSize:"13px",fontWeight:"bolder"}} className="fauldetiontable-riskimpactValue-dropdown-detail-value">{obj['RiskImpactValue']}</div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                    } 
                >
                    <div className="faultdetectionTable-riskcell" style={{backgroundColor:riskbackcolor,color:riskfontcolor}}>{Math.round(parseFloat(obj['RiskImpactValue'])).toString()}</div>
                </DropDownButton>
                
            );

            var processColour = '';
            var processText = '';
           
            if (obj['FRPStage'] == 'Completed') {
                processColour = '#17820d';
                processText = obj['FRPStage'];
            }
            else if (obj['FRPStage'] == ''){
                processColour = '#fafafa';
                processText = "";
            }
            else if (obj['FRPStage'] == 'New'){
                processColour = '#d13030';
                processText = obj['FRPStage'];
            }
            else if (obj['FRPStage'] == 'Open'){
                processColour = '#cf870c';
                processText = 'InProgress';
            }
            else if (obj['FRPStage'] == 'Closed'){
                processColour = '#17820d';
                processText = obj['FRPStage'];
            }
            else if (obj['FRPStage'] == 'Terminated'){
                processColour = '#eb5515';
                processText = obj['FRPStage'];
            }
            else if (obj['FRPStage'] == 'InProgress'){
                processColour = '#cf870c';
                processText = obj['FRPStage'];
            }
            else if (obj['FRPStage'] == 'Cancelled'){
                processColour = '#75320e';
                processText = obj['FRPStage'];
            }
            else if (obj['FRPStage'] == 'Assignment'){
                processColour = '#7592c7';
                processText = obj['FRPStage'];
            }
            else if (obj['FRPStage'] == 'Acknowledgement'){
                processColour = '#8e6dbd';
                processText = obj['FRPStage'];
            }
            processText = obj['FRPStage'];
           
            let column6 =(
                <div className="faultdetectionTable-processcell" style={{backgroundColor:processColour}}
                    onClick={() => { window.open(`${BASE_URL}Apps/CMAT/packagestageform?key=` + obj['StageFormMapKey']) }}
                    title="Go to Test Form"
                >
                    <div className="processcell-textContainer">{processText}</div> 
                    <div className="processcell-iconposition">
                        <div className="processcell-goicon"></div>
                    </div>
                </div>
            );

            let colmnprogresstext='';
            if(obj['CWOStage'] != undefined){
                colmnprogresstext = obj['CWOStage'];
            }
            else{
                colmnprogresstext='';
            }
            let colmnprogress=(<div></div>)
            if (obj['FRPStatus'] == 'Inprogress') {
                colmnprogress = (<div className="faultdetectionTable-ProgressNotCompletecell"
                                    onClick={() => { window.open(`${BASE_URL}Apps/CMAT/packagestageform?key=` + obj['StageFormMapKey']) }}
                                    title="Go to Test Form"
                                > 
                                    <div className="ProgressNotCompletecell-textContainer">{colmnprogresstext != '' ? colmnprogresstext : 'Inprogress'}</div>
                                    <div className="ProgressNotCompletecell-goiconposition">
                                        <div className='ProgressNotCompletecell-goicon'></div>
                                    </div>
                                </div>);
            }
            else{
                var duration = (Math.round((Math.abs(new Date(obj['ActionCompletionDatetime']).getTime() - new Date(obj['WorkFlowStartTime']).getTime()) / 3600000)*100)/100).toString();

                colmnprogress =(<div className="faultdetectionTable-ProgressCompletioncell"
                                    onClick={() => { window.open(`${BASE_URL}Apps/CMAT/packagestageform?key=` + obj['StageFormMapKey']) }}
                                    title="Go to Test Form"
                                >
                                    <div className="ProgressCompletioncell-iconPositioning">
                                        <div className='ProgressCompletioncell-defecticon'>{duration} Hrs</div>
                                    </div>
                                    <div className="ProgressCompletioncell-textContainer">{colmnprogresstext != '' ? colmnprogresstext : 'Completed'}</div>
                                    <div className="ProgressCompletioncell-DateContainer" title="Action Completion Time">{obj['ActionCompletionDatetime']}</div>
                                    <div className="ProgressCompletioncell-goiconposition">
                                        <div className='ProgressCompletioncell-goicon'></div>
                                    </div>
                                </div>);
            }

            let column7 =(
                            <div className="faultdetectionTable-workordercell" style={{visibility:checkshowing(obj['CWOKey'])}}
                                onClick={() => { 
                                    //window.open(`${BASE_URL}Apps/CorrectiveWorkOrder/view?key=${obj['CWOKey']}#!tabs.ov=2`);
                                    //window.open(`/Apps/ClientSSO/sso?next=%2Fapps%2Fivivafacility%2Fwo-details?key=${obj['CWOKey']}`);
                                    // window.open(`https://ssi.iviva.cloud/Apps/ivivaFacility/wo-details?key=${obj['CWOKey']}`);
                                    window.open(
                                        `${BASE_URL}/Apps/ivivaFacility/wo-details?key=${obj["CWOKey"]}`
                                      );
                                }}
                                title="Go to WorkOrder"
                            >
                                <div className="workordercell-workordericon"></div>
                            </div>
                        );
            totalcost=totalcost+costoffail;


            let column8 =(<div></div>);
            if(obj['IsVerify'] != undefined){
                if(obj['IsVerify'] != "" && obj['FRPStage'] == 'Completed'){
                    column8 =(
                        <div style={{ height: "50px", position: "relative" }}>
                            <div className="faultdetectionTable-faultystatus-icon-position">
                                <div className="faultdetectionTable-faultystatus-icon-container" title={`${obj['IsVerify'] == '1' ? "Work Verification is Successful" : "Work Verification is Failed"}`} style={{backgroundColor: obj['IsVerify'] == '1' ? "#68d65c" : "#e6e15c"}}
                                    // onClick={() => {
                                        
                                    // }}
                                ><div className={`faultdetectionTable-faultystatus-icon-${obj['IsVerify'] == '1' ? "correct" : "warning"}`}></div></div>
                            </div>
                        </div>
                    )
                }
                else{
                    column8 =(<div></div>);
                }
            }
            else{
                column8 =(<div></div>);
            }
            return(
                {
                    EquipmentID:column1,
                    ServingLocations:column2,
                    FaultDetected:column3,
                    CostOfFailure:column4,
                    RiskImpactValue:column5,
                    //Process : column6,
                    Process : (props.RSProcess=='Exclude Process'? colmnprogress : column6),
                    WorkOrder:column7,
                    FaultyStatus : column8,
                    RSPRUseAPI : "0",
                    CWOKey : obj['CWOKey'],
                    StageFormMapKey : obj['StageFormMapKey'],
                    IsVerify : obj['IsVerify']
                }
            )
        });
        setTableData(bodyfinaldata);
        setTotalSaving((Math.round(totalcost*100)/100).toString());
    }

    function checkshowing(xt:string){
        if(xt != '' && xt !=null){
            return 'visible'
        }
        else{
            return 'hidden'
        }
    }

    React.useEffect(() => {
        setTableHeight(props.TableHeight);
    }, [props]);

    const getDataItems = (max: number, pageToken: string) => {
        let last = 0
        if (pageToken !== null) last = parseInt(pageToken);
        let p = new Promise<{ items: Array<any>, pageToken: string }>((resolve, reject) => {
            let data = TableData.filter((item: any, key: number) => (key >= last && key < last + max));
            let response = { items: data, pageToken: (last + data.length).toString() }
           resolve(response);
        })
        return p;
    }

    return(
        <div style={{height:TableHeight}} className="faultdetectionTable">
            <DataTable
                data={(max, last) => getDataItems(max, last)}
                pageSize={3}
                showFooter={true}
                showEndOfContent={true}
                columns={[
                    {
                        title: ()=>
                            <div className="faultdetectionTable-FaultEquipmentHead">
                                Equipment
                                <div className="FaultEquipmentHead-infoposition">
                                    <DropDownButton 
                                        position="left" 
                                        showOnHover={false}
                                        className="faultdetectionTable-EquipmentLegend-dropdown"
                                        content={() => 
                                            <div>{equpmentLegend}</div>
                                        } 
                                    >
                                        <div className="FaultEquipmentHead-infoicon"></div>
                                    </DropDownButton>
                                </div>
                            </div>
                        ,
                        width: "18%",
                        renderColumn: (item) => {
                            return(<div style={{paddingLeft:"10px",paddingTop:"5px",paddingBottom:"10px"}}>{item.EquipmentID}</div>)
                        }
                    },
                    {
                        title: ()=><div style={{paddingLeft:"10px",textAlign:"left"}}>Serving Locations</div>,
                        width: "16%",
                        renderColumn: (item) => {
                            return(<div style={{paddingLeft:"10px",paddingTop:"5px",paddingBottom:"10px"}}>{item.ServingLocations}</div>)
                        }
                    },
                    {
                        title: ()=>
                            <div className="faultdetectionTable-FaultDetectHead">
                                Fault Detected
                                <div className="FaultDetectHead-infoposition">
                                    <DropDownButton 
                                        position="right" 
                                        showOnHover={false}
                                        className="faultdetectionTable-RiskImpactValueLegend-dropdown"
                                        content={() => 
                                            <div>{rescitificationtype}</div>
                                        } 
                                    >
                                        <div className="FaultDetectHead-infoicon"></div>
                                    </DropDownButton>
                                </div>
                            </div>
                        ,
                        width: "18%",
                        renderColumn: (item) => {
                            return(<div style={{paddingLeft:"10px",paddingBottom:"10px",paddingTop:"5px"}}>{item.FaultDetected}</div>)
                        }
                    },
                    {
                        title: ()=><div style={{paddingLeft:"10px",textAlign:"left",width:"100px"}}>{`Cost Of Failure (${props.CurrencyType})`}</div>,
                        width: "9%",
                        renderColumn: (item) => {
                            return(<div style={{paddingLeft:"10px",paddingBottom:"10px"}}>{item.CostOfFailure}</div>)
                        }
                    },
                    {
                        title: ()=>
                            <div className="faultdetectionTable-RiskValueHead">
                                Risk Impact Value
                                <div className="RiskValueHead-infoposition">
                                    <DropDownButton 
                                        position="right" 
                                        showOnHover={false}
                                        className="faultdetectionTable-RiskImpactValueLegend-dropdown"
                                        content={() => 
                                            <div>{RiskRangeLegend}</div>
                                        } 
                                    >
                                        <div className="RiskValueHead-infoicon"></div>
                                    </DropDownButton>
                                </div>
                            </div>
                        ,
                        width: "5%",
                        renderColumn: (item) => {
                            return(<div style={{paddingLeft:"10px",paddingBottom:"10px"}}>{item.RiskImpactValue}</div>)
                        }
                    },
                    {
                        title: ()=><div style={{paddingLeft:"10px",textAlign:"left"}}>Resolution Process</div>,
                        width: "13%",
                        renderColumn: (item) => {
                            if(item.RSPRUseAPI == "1" && item.CWOKey != null && item.CWOKey != ""){
                                return(
                                    <div style={{paddingLeft:"20px",paddingBottom:"10px"}}>
                                        <ResolutionProcess CWOKey={item.CWOKey} StageFormMapKey={item.StageFormMapKey}  uxpContext = {props.uxpContext} />
                                    </div>
                                )
                            }
                            else{
                                return(<div style={{paddingLeft:"10px",paddingBottom:"10px"}}>
                                        {item.Process }
                                    </div>
                                )
                            }
                        }
                    },
                    {
                        title: ()=><div style={{paddingLeft:"0px",textAlign:"left"}}>CWO</div>,
                        width: "5%",
                        renderColumn: (item) => {
                            return(<div style={{paddingLeft:"10px",paddingBottom:"10px"}}>{item.WorkOrder}</div>)
                        }
                    },
                    {
                        title: ()=><div style={{paddingLeft:"0px",textAlign:"left"}}></div>,
                        width: "5%",
                        renderColumn: (item) => {
                            if(item.RSPRUseAPI == "1" && item.CWOKey != null && item.CWOKey != "" && item.IsVerify != undefined){
                                return(
                                    <IsVerifyColumn CWOKey={item.CWOKey} IsVeryfy={item.IsVerify}  uxpContext = {props.uxpContext}/>
                                )
                            }
                            else{
                                return(item.FaultyStatus);
                            }
                        }
                    }
                    
                ]}
            />
            <div>
                <div className="faultdetectionTable-ColumnDevide">
                    <div className="faultdetectionTable-Column" style={{width:"50%"}}></div>
                    <div className="faultdetectionTable-Column" style={{width:"50%"}}>
                        <div style={{width:"100%",position:"relative"}}>
                            <div className="faultdetectionTable-TotalCostBox" style={{marginTop:"-30px"}}>
                                <div className="faultdetectionTable-ColumnDevide">
                                    <div className="faultdetectionTable-Column" style={{width:"42%"}}>
                                        <div className="TotalCostBox-Textcontainer">Total Saving : </div>
                                    </div>
                                    <div className="faultdetectionTable-Column" style={{width:"58%"}}>
                                        <div className="TotalCostBox-valueContainerbox">{`${props.CurrencyType} `} {TotalSaving}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <LinkWidgetContainer
                show={showInsight}
                className="InsightPopup-DarkTheam"
                onOpen={() => { }}
                onClose={() => setshowInsight(false)}
                title={
                        <div style={{color:"white",backgroundColor:"#424242",width:"100%"}}>
                            <div className="InsightPopup-ColumnDevideX" style= {{width:"100%"}}>
                                <div className="InsightPopup-ColumnX" style= {{width:"5%"}}>
                                    <div className="Insight-fauldetiontable-insighticon-container">
                                        <div className="Insight-fauldetiontable-insighticon"></div>
                                    </div>
                                </div>
                                <div className="InsightPopup-ColumnX" style= {{width:"45%"}}>
                                    <div style={{marginLeft:"-28px",paddingTop:"3px"}}>Insight</div>
                                </div>
                                <div className="InsightPopup-ColumnX" style= {{width:"50%"}}>
                                    <div className='fauldetiontable-insight-header-assetid'
                                        onClick={() => {
                                            var locoriginurl = window.location.origin;
                                            window.open(`${locoriginurl}/Apps/IBMS/ibms.monitor.point.wrapper?key=${AssetKey}`);
                                        }}
                                    >
                                        {AssetID}
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
            >
                <div style={{position:"relative",paddingLeft:"20px",paddingRight:"20px"}}>
                    <Insight 
                        TestInstantMapKey={TestInstantMapKey}
                        AssetKey={AssetKey}
                        IsDefect={IsDefect}
                        TestName={TestName}
                        TimeOffset ={parseFloat(props.Offset)}
                        FaultyDescription={FaultyDescriptions}
                        uxpContext = {props.uxpContext}
                    />
                </div>
            </LinkWidgetContainer>

        </div>
    )
}
export default FaultyDetectionTable;

interface IRPProps {
    CWOKey:string;
    StageFormMapKey:string;
    uxpContext?: IContextProvider
}
const ResolutionProcess: React.FunctionComponent<IRPProps> = (props) => {
    const Base_origin = window.location.origin;
    const [ProcessColor, setProcessColor] = React.useState('');
    const [ProcessText, setProcessText] = React.useState('');

    React.useEffect(() => {
        GetResolutionProcess(props.CWOKey);
    }, [props.CWOKey]);

    function GetResolutionProcess(cwk : string){
        //let appurl = 'C2ODemo/C2ODemoOrphans';
        // let execurl = `${Base_origin}/api/${appurl}/FacilityCWOTestAPI`;
        // let parm = `&CWOKey=${cwk}`
        // axios.get(`${execurl}?apikey=${props.uxpContext?.apiKey}${parm}`)
        // .then(response => {
        //     let res : any[] = response.data;
        props.uxpContext?.executeAction("CMATUXPDashboard", "GetCWODetails_Facility", { CWOKey :  cwk}, { json: true })
        .then(response => {
            
            let res : any[] = JSON.parse(response);

            if(res.length>0){
                
                if (res[0]['Stage'] == 'Completed') {
                    setProcessColor('#17820d');
                    setProcessText(res[0]['Stage']);
                }
                else if (res[0]['Stage'] == ''){
                    setProcessColor('#fafafa');
                    setProcessText("");
                }
                else if (res[0]['Stage'] == 'New'){
                    setProcessColor('#d13030');
                    setProcessText(res[0]['Stage']);
                }
                else if (res[0]['Stage'] == 'Open'){
                    setProcessColor('#cf870c');
                    setProcessText('InProgress');
                }
                else if (res[0]['Stage'] == 'Closed'){
                    setProcessColor('#17820d');
                    setProcessText(res[0]['Stage']);
                }
                else if (res[0]['Stage'] == 'Terminated'){
                    setProcessColor('#eb5515');
                    setProcessText(res[0]['Stage']);
                }
                else if (res[0]['Stage'] == 'InProgress'){
                    setProcessColor('#cf870c');
                    setProcessText(res[0]['Stage']);
                }
                else if (res[0]['Stage'] == 'Cancelled'){
                    setProcessColor('#75320e');
                    setProcessText(res[0]['Stage']);
                }
                else if (res[0]['Stage'] == 'Assignment'){
                    setProcessColor('#7592c7');
                    setProcessText(res[0]['Stage']);
                }
                else if (res[0]['Stage'] == 'Acknowledgement'){
                    setProcessColor('#8e6dbd');
                    setProcessText(res[0]['Stage']);
                }
            }
            else{
                setProcessColor('');
                setProcessText('');
            }
        })
        .catch(e => {
            console.log("except: ", e);
            setProcessColor('');
            setProcessText('');
        })
    }

    return(
        <div className="faultdetectionTable-processcell" style={{backgroundColor:ProcessColor}}
            onClick={() => { window.open(`${BASE_URL}Apps/CMAT/packagestageform?key=${props.StageFormMapKey}`) }}
            title="Go to Test Form"
        >
            <div className="processcell-textContainer">{ProcessText}</div> 
            <div className="processcell-iconposition">
                <div className="processcell-goicon"></div>
            </div>
        </div>
    )
}




interface IVeryfypros {
    CWOKey:string;
    IsVeryfy:string;
    uxpContext?: IContextProvider
}
const IsVerifyColumn: React.FunctionComponent<IVeryfypros> = (props) => {
    const [ProcessStatus, setProcessStatus] = React.useState('');
    React.useEffect(() => {
        GetResolutionProcess(props.CWOKey);
    }, [props.CWOKey]);

    function GetResolutionProcess(cwk : string){
        props.uxpContext?.executeAction("CMATUXPDashboard", "GetCWODetails_Facility", { CWOKey :  cwk}, { json: true })
        .then(response => {
            let res : any[] = JSON.parse(response);
            console.log("veryfy component work",res);
            if(res.length>0){
                setProcessStatus(res[0]['Stage']);
            }
            else{
                setProcessStatus("");
            }
        })
        .catch(e => {
            setProcessStatus("");
            console.log("except: ", e);
        })
    }

    return(
        <div style={{paddingLeft:"10px",paddingBottom:"10px"}}>
            {(ProcessStatus == "Completed" && props.IsVeryfy != "") && <div style={{ height: "50px", position: "relative" }}>
                <div className="faultdetectionTable-faultystatus-icon-position">
                    <div className="faultdetectionTable-faultystatus-icon-container" title={`${props.IsVeryfy == '1' ? "Work Verification is Successful" : "Work Verification is Failed"}`} style={{backgroundColor: props.IsVeryfy == '1' ? "#68d65c" : "#e6e15c"}}
                        // onClick={() => {
                            
                        // }}
                    ><div className={`faultdetectionTable-faultystatus-icon-${props.IsVeryfy == '1' ? "correct" : "warning"}`}></div></div>
                </div>
            </div>}
        </div>
    )
}
import * as React from 'react';
import { IContextProvider } from '../../../uxp';
import {TitleBar,useToast} from 'uxp/components';
import FaultyDetectionTable from '../../FaultyDetection/FaultyDetectionTable';

type SummaryDetails = {
    x: string;
    y: string;
    color: string;
    Infor: string;
    Xvalue: string;
};
interface IProps {
    DetailOBJ:SummaryDetails;
    System:string;
    Location:string;
    Year:string;
    Month:string;
    LocationName:string;
    TimeOffSet:number;
    CurrencyType:string;
    uxpContext?: IContextProvider;
}

type DataArray = {
    "AssetKey" : string;
    "AssetID" : string;
    "WorkFlowStartTime" : string;
    "ServingLocations" : string;
    "FaultDescription" : string;
    "MaterialCost" : string;
    "ManpowerCost" : string;
    "EnergyCost" : string;
    "WastageCost" : string;
    "RiskImpactValue" : string;
    "ActionCompletionDatetime" :string;
};

const HourlyDetailPopup: React.FunctionComponent<IProps> = (props) => {
    
    const [TableData, setTableData] = React.useState([]);
    const [Loading, setLoading] = React.useState(false);
    const [StartDate, setStartDate] = React.useState(`${props.Year}-${fixingDigit(parseInt(props.Month))}-${fixingDigit(parseInt(props.DetailOBJ.y))} ${fixingDigit( parseInt(props.DetailOBJ.Xvalue)-1 )}:00:00`);
    const [EndDate, setEndDate] = React.useState(`${props.Year}-${fixingDigit(parseInt(props.Month))}-${fixingDigit(parseInt(props.DetailOBJ.y))} ${fixingDigit( parseInt(props.DetailOBJ.Xvalue) )}:00:00`);
    const [DateRange, setDateRange] =React.useState({
        StartDate:`${props.Year}-${fixingDigit(parseInt(props.Month))}-${fixingDigit(parseInt(props.DetailOBJ.y))} ${fixingDigit( parseInt(props.DetailOBJ.Xvalue)-1 )}:00:00`,
        EndDate:`${props.Year}-${fixingDigit(parseInt(props.Month))}-${fixingDigit(parseInt(props.DetailOBJ.y))} ${fixingDigit( parseInt(props.DetailOBJ.Xvalue) )}:00:00`
    });

    React.useEffect(() => {
        setStartDate(`${props.Year}-${fixingDigit(parseInt(props.Month))}-${fixingDigit(parseInt(props.DetailOBJ.y))} ${fixingDigit( parseInt(props.DetailOBJ.Xvalue)-1 )}:00:00`);
        setEndDate(`${props.Year}-${fixingDigit(parseInt(props.Month))}-${fixingDigit(parseInt(props.DetailOBJ.y))} ${fixingDigit( parseInt(props.DetailOBJ.Xvalue) )}:00:00`);
        setDateRange({
            StartDate:`${props.Year}-${fixingDigit(parseInt(props.Month))}-${fixingDigit(parseInt(props.DetailOBJ.y))} ${fixingDigit( parseInt(props.DetailOBJ.Xvalue)-1 )}:00:00`,
            EndDate:`${props.Year}-${fixingDigit(parseInt(props.Month))}-${fixingDigit(parseInt(props.DetailOBJ.y))} ${fixingDigit( parseInt(props.DetailOBJ.Xvalue) )}:00:00`
        });
    }, [props]);

    React.useEffect(() => {
        getData();
    }, [DateRange]);
    
    let toast = useToast();
    const getData = async () => {
        // try { 
           
        //     let property ='https://script.google.com/macros/s/AKfycbz8Wc08dLjo1aFY17_DzBNw58Uirss9D6ktrlI0bIxOtafhtTaT/exec';
        //     let gotfaultydata = await fetch(property);
        //     let readyfaultydata = await gotfaultydata.json();
        //     setTableData(readyfaultydata);
        //     setLoading(true);
       
        // } catch (error) {
        //     console.log(error);
        // }
        let endDate =new Date(StartDate+ " UTC");
        endDate.setHours( endDate.getHours() + 1 );
        console.log(endDate.toISOString());
        props.uxpContext?.executeAction("C2ODashboard", "GetDefectDetailsHeatMap", {StartDate:StartDate,EndDate:endDate.toISOString(),TimeZoneIn:props.TimeOffSet,Systemkey:parseInt(props.System)}, { json: true })
        .then(res => {
            console.log("resxxxxxxxxxxxxxx", res);
            setTableData(res);
            setLoading(true);
        })
            .catch(e => {
            console.log("except: ", e)
            setTableData([]);
            setLoading(false)
            toast.error("Something went wrong")
        })
    }

    function fixingDigit(num : Number){
        return num > 9 ? "" + num: "0" + num;
    }

   
    if(Loading){
        return(
            <div style={{marginTop:"-35px"}}>
                <TitleBar title={`${props.Year}-${fixingDigit(parseInt(props.Month))}-${fixingDigit(parseInt(props.DetailOBJ.y))}  `+`  From ${fixingDigit( parseInt(props.DetailOBJ.Xvalue)-1 )}:00:00 To 
                 ${fixingDigit( parseInt(props.DetailOBJ.Xvalue) )}:00:00 `}>
                     <div style={{float:"right",}}><span style={{fontSize:"15px"}}>Building Name:</span><span style={{fontWeight:"bolder",fontSize:"15px"}}>{` ${props.LocationName}`}</span></div>
                </TitleBar>
                <div style={{}}>
                    <FaultyDetectionTable
                        FaultyDataSet = {TableData}
                        LocationKey = {props.Location}
                        CurrencyType={props.CurrencyType}
                        Offset={props.TimeOffSet.toString()}
                        TableHeight = "370px"
                        RSProcess ='Exclude Process'
                        uxpContext = {props.uxpContext}
                    />
                </div>
            </div>
        )
    }
    else{
        return(
            <div style={{marginTop:"-35px"}}>
                <TitleBar title={`${props.Year}-${fixingDigit(parseInt(props.Month))}-${fixingDigit(parseInt(props.DetailOBJ.y))}  `+`  From ${fixingDigit(parseInt(props.DetailOBJ.x)-1)} : 00 : 00 To 
                 ${fixingDigit(parseInt(props.DetailOBJ.x))} : 00 : 00`}>
    
                </TitleBar>
                <div style={{height:"200px",lineHeight:"200px",fontSize:"15px",fontWeight:"bolder",textAlign:"center"}}>
                        Loading ...
                </div>
            </div>
        )
    }
}
export default HourlyDetailPopup;
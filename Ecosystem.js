import React, {Component} from "react";
import Header from "../Layout/Header.js";
import LeftNav from "../Layout/LeftNav.js";
import ajaxCall from "../utility/ajaxCall";
import universalFunctions from "../utility/UniversalFunctions.js";
import {Doughnut} from "react-chartjs-2";
import {NavLink} from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faCircle} from "@fortawesome/free-regular-svg-icons/";


library.add(faCircle);
class Ecosystem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tags: null,
            title: "My Ecosystem",
            totalScanned: 0,
            violationTags: 0,
            violations: {},
            violationsHtml: '',
            passedURLPref:'',
            leftNav: {
                policies: false,
                reports: false,
                tags: false,
            },
            chartData: {},
        };
        this.recordGAClick = this.recordGAClick.bind(this);
    }

    /**
     * Checks a string to see if it is numeric.
     * @param n
     * @returns {boolean}
     */
    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    /**
     * Routes to Tag Manager Page
     */
    sendToTagManager = () => {
        universalFunctions.sendEventGoogleA("Ecosystem", "View All Tags Click", 1);
        window.location.assign('/TagManager');
    };

    /**
     * Routs to Tags In Violation Page
     */
    sendToTagsInViolation = () => {
        window.location.assign('/TagsInViolation');
    };
    tagsInViolationUrlBuild = (data) => {
        var prioritySet = 1000;
        var setAction = "";
        data.forEach(function (violation) {
            if(violation.actionNeeded > "" && prioritySet === 1000){
                prioritySet = violation.priority;
                if(violation.actionNeeded !== 100){
                    setAction = "action_needed";
                } else {
                    setAction = "all"
                }
            }

        });
        if(prioritySet === 1000){prioritySet = 100; setAction="all"}
        var url = "priority="+prioritySet+"&state="+setAction;
        this.state.passedURLPref = url;
    }
    /**
     * Fetch the stats on load
     */
    componentDidMount() {
        this.fetchEcosystemStats();
        document.title = this.state.title;
    };

    /**
     * Fetch tag statistics
     */
    fetchEcosystemStats() {
        let handleResponse = responseData => {
            let state = {};
            state.totalScanned = responseData.totalScanned;
            state.violationTags = responseData.violationTags;
            state.violations = responseData.violations;
            this.setState(state, function () {
                this.buildChartData();
            });
        };

        let queryParams = {};
        queryParams.controller = 'ecosystem/stats';

        new Promise(() => {
            ajaxCall
                .get(queryParams)
                .then(responseData => handleResponse(responseData));
        });
    }
    recordGAClick = (event, action) => {
        universalFunctions.sendEventGoogleA("Ecosystem", action, 1);
    }
    /**
     * Maps the violations HTML.
     * this.state.violations is an object so it must be mapped this way.
     */
    buildViolationMap() {
        if (this.state.violations) {
            if(Object.keys(this.state.violations).length !== 0){this.tagsInViolationUrlBuild(this.state.violations);}
            this.state.violationsHtml = Object.keys(this.state.violations).map((key) => (
                <div key={this.state.violations[key].priority} className="row">
                    <div className="cell left" data-title="Name">
                        <NavLink className="clickable" to={"/Ecosystem/TagsInViolation?priority="+this.state.violations[key].priority+"&state=action_needed"} onClick={this.recordGAClick.bind(this, event, "View Tag Violations "+this.state.violations[key].priority)}>
                            <FontAwesomeIcon icon={faCircle} className={
                                parseInt(this.state.violations[key].priority) === 100 ? "ismalw" :
                                    parseInt(this.state.violations[key].priority) === 50 ? "ishigh"
                                        : parseInt(this.state.violations[key].priority) === 30 ? "ismid"
                                        : "islow"
                            }/>

                            {universalFunctions.addComma(this.state.violations[key].total)} {this.state.violations[key].label} {parseInt(this.state.violations[key].total) === 1 ? "Violation" : "Violations"}
                        </NavLink>
                    </div>
                    <div className="cell" data-title="number">{universalFunctions.addComma(this.state.violations[key].actionNeeded)}</div>
                    <div className="cell" data-title="number">{universalFunctions.addComma(this.state.violations[key].inProgress)}</div>
                </div>
            ));
        }

    };

    /**
     * Builds the chart data for the chart to render
     */
    buildChartData(urlPass) {
        if (typeof this.state.violations === 'object' && Object.entries(this.state.violations).length !== 0) {
            let labels = [];
            let data = [];

            this.state.violations.forEach(function (violation) {
                labels.push(violation.label);
                data.push(violation.total);
            });
            let chart = {};
            chart.labels = labels;
            chart.datasets = [];
            chart.datasets.push(
                {
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: [
                        'rgba(250,2,69,1)',
                        'rgba(247,122,16,1)',
                        'rgba(255,201,0,1)',
                        'rgba(6,139,237,1)',
                    ],
                    borderColor: 'rgba(255,255,255,1)',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgba(75,192,192,1)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverBackgroundColor: [
                        'rgba(250,2,69,1)',
                        'rgba(236,99,118,1)',
                        'rgba(247,122,16,1)',
                        'rgba(248,186,68,1)',
                    ],
                    pointHoverBorderColor: 'rgba(255,255,255,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    showTooltip: false,
                    data: data,
                }
            );

            this.setState({
                chartData: chart,
            });
        }
    }

    render() {
        this.buildViolationMap();
        return (
            <div>
                <Header titleCallback={this.defineTheTitleInHeader} title={this.state.title} key={this.state.title}/>
                <div className="mdh_main">
                    <LeftNav leftNavData={this.state.leftNav} key={this.state.title}/>

                    <div className="mec_viewp" id="mec_viewp">

                        <div className="mdh_box_views">

                            <div className="mdh_box_1">
                                <div className="mdh_dummy"/>

                                <div className="mdh_info">
                                    <h3>Tags in violation</h3>
                                    <h1 style={{margin: '0px 0px 0px 0px'}}>{universalFunctions.addComma(this.state.violationTags)}</h1>
                                    <div className="chart-container" style={{position: 'relative'}}>
                                        <Doughnut ref="chart" data={this.state.chartData} options={{
                                            tooltips: {
                                                enabled: false
                                            },
                                            legend: {
                                                display: false
                                            },
                                            hover: {
                                                mode: null
                                            }
                                        }}/>
                                        <div className="donut-inner">
                                            <h4>number of tags<br/> scanned</h4>
                                            <h2>{universalFunctions.addComma(this.state.totalScanned)}</h2>
                                            <button className="view_btn_sm" onClick={this.sendToTagManager.bind(this)}>
                                                View All Tags
                                            </button>
                                        </div>
                                    </div>

                                    <div className="wrapper">
                                        <div className="table">
                                            <div className="row header">
                                                <div className="cell"/>
                                                <div className="cell">Action Needed</div>
                                                <div className="cell">In Progress</div>
                                            </div>
                                            {this.state.violationsHtml}
                                        </div>
                                    </div>
                                    <NavLink className="mn_btn_white" to={"/Ecosystem/TagsInViolation?"+this.state.passedURLPref} onClick={this.recordGAClick.bind(this, event, "View All Tag Violations")}>
                                        View All Tag Violations
                                    </NavLink>
                                </div>
                            </div>

                            {/*<div className="mdh_box_3">*/}
                            {/*<div className="mdh_dummy"/>*/}
                            {/*<div className="mdh_info">*/}
                            {/*<h3>Tags in violation</h3>*/}

                            {/*<button className="view_btn" style={{float: 'right'}}>*/}
                            {/*View All Tag Violation*/}
                            {/*</button>*/}

                            {/*</div>*/}
                            {/*</div>*/}


                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Ecosystem;

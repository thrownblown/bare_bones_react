import React from 'react';
import Collapse from 'react-bootstrap/Collapse';
import moment from 'moment';
import Image from 'react-bootstrap/Image';
import Badge from 'react-bootstrap/Badge';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';


let boxStyle = {
            border: '1px', 
            borderStyle: 'solid',
            borderColor: 'black',
            borderRadius: '4px',
            padding: '10px',
            marginTop: '2px',
            marginBottom: '2px'
          };


class Board extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <Container style={{ marginTop: '70px', marginBottom: '90px' }}>
        { this.props.board.map((bucket) => {
          return <JobBucket {...bucket} open={this.props.open} key={bucket.header_id}/>
        }) }
      </Container>
    );
  }
}


class JobList extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  renderJobCards () {
    return this.props.jobs.map((jerb) => {
        return <JobCard key={jerb.id} job={jerb} />
      })
  } 

  render() {
    return(
    <div>
      {this.renderJobCards()}
    </div>
    )
  }
};


class JobBucket extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { open: this.props.open };
    this.showDrop = this.showDrop.bind(this);
  }
  showDrop() { 
    this.setState({ open: !this.state.open });
   }
  render() {
    let jobList = <JobList jobs={this.props.jobs}/>;
    return(
      <Row>
        <Col style={boxStyle} xs={12} onClick={this.showDrop}>
          <Row>
            <Col>
              <strong>{this.props.header_name}
              </strong>
            </Col>
            <Col >
              <div className="float-right">
                <Badge variant="dark" style={{marginLeft:"auto"}}>
                  {this.props.header_count}
                </Badge>
              </div>
            </Col>
          </Row>
        </Col>
        {this.state.open ? jobList : null }
      </Row>
    )
  }
};


class JobCard extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.showDrop = this.showDrop.bind(this);
    this.showBigDrop = this.showBigDrop.bind(this);
    this.showBigPick = this.showBigPick.bind(this);
    this.state = {
      open: false,
      big_drop: false,
      big_pick: false,
      big_route : true
    };
  }

  jobTimeframeString(){
    const DELIVERY_STATUS_NO_STATUS = -1,
          DELIVERY_STATUS_NEW = 0,
          DELIVERY_STATUS_NOT_PICKED = 1,
          DELIVERY_STATUS_PICKED = 2,
          DELIVERY_STATUS_STOPS_MADE = 3,
          DELIVERY_STATUS_DELIVERED = 4,
          DELIVERY_STATUS_POD_ENTERED = 5,
          DELIVERY_STATUS_COMPLETE = 6,
          DELIVERY_STATUS_SIGNED = 7,
          DELIVERY_STATUS_UNDELIVERABLE = 8,
          JOB_STATUS_UNDELIVERABLE = 9;

      let timediff,
          now = new Date();

      if (this.props.job.delivery_status == DELIVERY_STATUS_DELIVERED || this.props.job.delivery_status == DELIVERY_STATUS_COMPLETE) {
          let drop_time_localized = new Date(this.props.job.drop_timestamp);
          if (typeof moment != "undefined") {
              if (drop_time_localized.getDate() == now.getDate()){
                  return "Delivered " + moment(drop_time_localized).format('h:mm a');
              } else {
                  return "Delivered " + moment(drop_time_localized).format('M/D h:mm a');
              }
          } else {
              return "Delivered " + drop_time_localized;
          }

      } else if (this.props.job.assignment_status == JOB_STATUS_UNDELIVERABLE) {
          return "Undeliverable";
      } else if (this.props.job.is_cancelled) {
          return "Cancelled";
      }

      let ready_time_localized = new Date(this.props.job.ready_timestamp);

      let due_time_localized = new Date(this.props.job.due_timestamp);

      if (ready_time_localized > now){
          timediff = ready_time_localized - now;
          return "Ready in " + moment.duration(timediff).humanize();
      } else if (due_time_localized > now) {
          timediff = due_time_localized - now;
          return "Due in " + moment.duration(timediff).humanize();
      }

      timediff = now - due_time_localized;
      return "Due " + moment.duration(timediff).humanize() + " ago";
  }

  finInfo() {
    if (this.props.job.payment_method == 1) {
      return <span class="text-warning"> {this.props.job.financial_info }</span>;
    } else if (this.props.job.payment_method == 6 || this.props.job.payment_method == 5) { 
      return <span class="text-danger"> {this.props.job.financial_info }</span>; 
    } else if (this.props.job.payment_method == 2 || this.props.job.payment_method == 4 || this.props.job.payment_method == 3 || this.props.job.payment_method == 7) {
      return <span class="text-success">  {this.props.job.financial_info }</span>;
    } 
  }

  routeMap() {
    return 'https://twinjet-static.s3.amazonaws.com/routemaps/' + this.props.job.id + '_route_map.png';
  }

  pickMap() { 
    return 'https://twinjet-static.s3.amazonaws.com/routemaps/' + this.props.job.id + '_pick_map.png';
  }
  dropMap() { 
    return 'https://twinjet-static.s3.amazonaws.com/routemaps/' + this.props.job.id + '_drop_map.png';
  }

  showDrop() { this.setState({ open: !this.state.open }) }
  showBigDrop() { this.setState({ big_drop: !this.state.big_drop }) }
  showBigPick() { this.setState({ big_pick: !this.state.big_pick }) }
  showBigRoute() { this.setState({ big_pick: !this.state.big_pick }) }

  render() {
    const maprow =(

      <div class="row">
        <div class="col">
          <Image fluid rounded src={this.pickMap()}/>
        </div>
        <div class="col">
          <Image fluid rounded src={this.routeMap()}/>
        </div>
        <div class="col">
          <Image fluid rounded src={this.dropMap()}/>
        </div>
      </div>
    );

    return (
      <div style={boxStyle} className="job-card" id={this.props.job.id}>
      <Row>
        <Col xs={6} >
          <Row>
            <Col sm={12} md={6} onClick={this.showDrop}>
              <AddressCard address={this.props.job.origin_address} />
              <p>
                <em>{this.props.job.ready_due_times}</em>
                <br/>
                {this.jobTimeframeString()}
              </p>
            </Col>
            <Col sm={12} md={6} className="d-none d-sm-block" onClick={this.showBigPick}>
              <Image fluid rounded src={this.pickMap()}/>
            </Col>
          </Row>
        </Col>
        <Col xs={6}>
          <Row>
            <Col sm={12} md={6} onClick={this.showDrop}>
              <AddressCard address={this.props.job.destination_address}/>
              <p>{this.finInfo()}</p>
            </Col>
            <Col sm={12} md={6} className="d-none d-sm-block" onClick={this.showBigDrop}>
              <Image fluid rounded src={this.dropMap()}/>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row >
        <Col>

          {this.state.open ? maprow : null }

          <Collapse in={this.state.open}>
            <div id="example-collapse-text">
              <strong>Assignment Status:</strong>{this.props.job.assignment_status}<br/>
              <strong>Billing Reference:</strong>{this.props.job.billing_reference}<br/>
              <strong>Client Name:</strong>{this.props.job.client.name}<br/>
              <strong>Courier:</strong>{this.props.job.courier}<br/>
              <strong>creation_method:</strong>{this.props.job.creation_method}<br/>
              <strong>delivery_notes:</strong>{this.props.job.delivery_notes}<br/>
              <strong>delivery_status:</strong>{this.props.job.delivery_status}<br/>
              <strong>destination_address name:</strong>{this.props.job.destination_address.name}<br/>
              <strong>destination_address street_address:</strong>{this.props.job.destination_address.street_address}<br/>
              <strong>destination_address city:</strong>{this.props.job.destination_address.city}<br/>
              <strong>destination_address state:</strong>{this.props.job.destination_address.state}<br/>
              <strong>drop_timestamp:</strong>{this.props.job.drop_timestamp}<br/>
              <strong>due_time:</strong>{this.props.job.due_time}<br/>
              <strong>due_timestamp:</strong>{this.props.job.due_timestamp}<br/>
              <strong>external_id:</strong>{this.props.job.external_id}<br/>
              <strong>financial_info:</strong>{this.props.job.financial_info}<br/>
              <strong>id:</strong>{this.props.job.id}<br/>
              <strong>is_cancelled:</strong>{this.props.job.is_cancelled}<br/>
              <strong>is_ready:</strong>{this.props.job.is_ready}<br/>
              <strong>order_total:</strong>{this.props.job.order_total}<br/>
              <strong>origin_address name:</strong>{this.props.job.origin_address.name}<br/>
              <strong>origin_address street_address:</strong>{this.props.job.origin_address.street_address}<br/>
              <strong>origin_address city:</strong>{this.props.job.origin_address.city}<br/>
              <strong>origin_address state:</strong>{this.props.job.origin_address.state}<br/>
              <strong>payment_method:</strong>{this.props.job.payment_method}<br/>
              <strong>payment_method_as_string:</strong>{this.props.job.payment_method_as_string}<br/>
              <strong>pick_timestamp:</strong>{this.props.job.pick_timestamp}<br/>
              <strong>provider:</strong>{this.props.job.provider}<br/>
              <strong>ready_due_times</strong>{this.props.job.ready_due_times}<br/>
              <strong>ready_time:</strong>{this.props.job.ready_time}<br/>
              <strong>ready_timestamp:</strong>{this.props.job.ready_timestamp}<br/>
              <strong>requires_photo:</strong>{this.props.job.requires_photo}<br/>
              <strong>requires_pod:</strong>{this.props.job.requires_pod}<br/>
              <strong>requires_signed_pod:</strong>{this.props.job.requires_signed_pod}<br/>
              <strong>service_price:</strong>{this.props.job.service_price}<br/>
              <strong>special_instructions:</strong>{this.props.job.special_instructions}<br/>
              <strong>status:</strong>{this.props.job.status}<br/>
              <strong>status_as_string:</strong>{this.props.job.status_as_string}<br/>
              <strong>tip:</strong>{this.props.job.tip}<br/>
            </div>
          </Collapse>
        </Col>
      </Row>
      </div>
    );
  }
} 


class AddressCard extends React.Component {
  constructor(props, context) {
    super(props, context);

  }

  render() {

    return (
      <div style={{margin: '5px'}}>
        <strong>{this.props.address.name}</strong><br/>
        {this.props.address.street_address}<br/>
        {this.props.address.city} {this.props.address.state} {this.props.address.postal_code}<br/>
        {this.props.address.contact}<br/>
      </div>
    );
  }
}


export default Board;

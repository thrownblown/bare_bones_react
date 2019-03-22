import React from 'react';
import Collapse from 'react-bootstrap/Collapse';
import moment from 'moment';
import Image from 'react-bootstrap/Image';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';


let boxStyle = {
            border: '1px', 
            borderStyle: 'solid',
            borderColor: 'black',
            borderRadius: '4px',
            padding: '10px',
            marginTop: '2px',
            marginBottom: '2px'
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
              <Row>
                <Col sm={6} >
                  <strong>TwinJet ID:</strong> {this.props.job.id}<br/>
                  <strong>External ID:</strong> {this.props.job.external_id}<br/>
                  <strong>Client Name:</strong> {this.props.job.client.name}<br/>
                  <strong>Courier:</strong> {this.props.job.courier}<br/>
                  <strong>Ready Time:</strong> {this.props.job.ready_timestamp ? moment(new Date(this.props.job.ready_timestamp)).format('M/D h:mm a') : 'None'}<br/>
                  <strong>Due Time:</strong> {this.props.job.due_timestamp ? moment(new Date(this.props.job.due_timestamp)).format('M/D h:mm a') : 'None'}<br/>
                  <strong>Pick Up Time:</strong> {this.props.job.pick_timestamp ? moment(new Date(this.props.job.pick_timestamp)).format('M/D h:mm a') : 'Nope'}<br/>
                  <strong>Delivery Time:</strong> {this.props.job.drop_timestamp ? moment(new Date(this.props.job.drop_timestamp)).format('M/D h:mm a') : 'Nada'}<br/>
                </Col>
                <Col sm={6}>
                  <strong>Special Instructions:</strong> {this.props.job.special_instructions}<br/>
                  <strong>Status:</strong> {this.props.job.status_as_string}<br/>
                  <strong>Cancelled:</strong> {this.props.job.is_cancelled ? 'Yes' : 'No'}<br/>
                  <strong>Ready:</strong> {this.props.job.is_ready ? 'Yes' : 'No'}<br/>
                  <strong>Photo Required:</strong>{ this.props.job.requires_photo ? 'Yes' : 'No' }<br/>
                  <strong>POD Required:</strong> { this.props.job.requires_pod ? 'Yes' : 'No' }<br/>
                  <strong>Delivery Fee:</strong> ${this.props.job.service_price}<br/>
                  <strong>Tip:</strong> ${this.props.job.tip}<br/>
                  <strong>Order Total:</strong> {this.props.job.order_total}<br/>
                  <strong>Payment Method:</strong> {this.props.job.payment_method_as_string}<br/>
                </Col>
              </Row>
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

export default JobCard;

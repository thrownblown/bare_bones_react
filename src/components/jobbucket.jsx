import React from 'react';
import Badge from 'react-bootstrap/Badge';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import JobCard from './jobcard.jsx'


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




export default Board;

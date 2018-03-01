import _ from "lodash";
import React, { PropTypes } from "react";
import ReactDOM from "react-dom";
import { Grid, Row, Col } from "react-bootstrap";
import TaxonAutocomplete from "../../../observations/uploader/components/taxon_autocomplete";
import PlaceAutocomplete from "../../../observations/identify/components/place_autocomplete";
import UserAutocomplete from "../../../observations/identify/components/user_autocomplete";
import util from "../../../observations/show/util";
import SplitTaxon from "../../../shared/components/split_taxon";
import DateTimeFieldWrapper from
  "../../../observations/uploader/components/date_time_field_wrapper";

class RegularForm extends React.Component {

  qualityGradeValues( ) {
    const checkedInputs = $( "input[name=quality_grade]:checked", ReactDOM.findDOMNode( this ) );
    return _.map( checkedInputs, a => a.value ).join( "," ) || null;
  }

  render( ) {
    const {
      config,
      project,
      addProjectRule,
      removeProjectRule,
      setRulePreference,
      updateProject
    } = this.props;
    return (
      <div id="RegularForm" className="Form">
        <Grid>
          <Row className="text">
            <Col xs={12}>
              <h2>Observation Requirements</h2>
              <div className="help-text">
                Please specify the requirements for the observations to be added to this project.
                You can have multiple species and places.
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={4}>
              <label>Taxa</label>
              <TaxonAutocomplete
                ref="ta"
                bootstrap
                perPage={ 6 }
                searchExternal={ false }
                onSelectReturn={ e => {
                  addProjectRule( "in_taxon?", "Taxon", e.item );
                  this.refs.ta.inputElement( ).val( "" );
                } }
                config={ config }
                placeholder={ "Birds, monarch, etc." }
              />
              { !_.isEmpty( project.taxonRules ) && (
                <div className="icon-previews">
                  { _.map( project.taxonRules, taxonRule => (
                    <div className="icon-preview" key={ `taxon_rule_${taxonRule.taxon.id}` }>
                      { util.taxonImage( taxonRule.taxon ) }
                      <SplitTaxon
                        taxon={ taxonRule.taxon }
                        user={ config.currentUser }
                      />
                      <i
                        className="fa fa-times-circle"
                        onClick={ ( ) => removeProjectRule( taxonRule ) }
                      />
                    </div>
                  ) ) }
                </div>
              ) }
            </Col>
            <Col xs={4}>
              <label>Locations</label>
              <PlaceAutocomplete
                ref="pa"
                afterSelect={ e => {
                  addProjectRule( "observed_in_place?", "Place", e.item );
                  this.refs.pa.inputElement( ).val( "" );
                } }
                bootstrapClear
                config={ config }
                placeholder={ "Zion National Park, Miami, etc." }
              />
              { !_.isEmpty( project.placeRules ) && (
                <div className="icon-previews">
                  { _.map( project.placeRules, placeRule => (
                    <div className="badge-div" key={ `place_rule_${placeRule.place.id}` }>
                      <span className="badge">
                        { placeRule.place.display_name }
                        <i
                          className="fa fa-times-circle-o"
                          onClick={ ( ) => removeProjectRule( placeRule ) }
                        />
                      </span>
                    </div>
                  ) ) }
                </div>
              ) }
            </Col>
            <Col xs={4}>
              <label>Users</label>
              <UserAutocomplete
                ref="ua"
                afterSelect={ e => {
                  e.item.id = e.item.user_id;
                  addProjectRule( "observed_by_user?", "User", e.item );
                  this.refs.ua.inputElement( ).val( "" );
                } }
                bootstrapClear
                config={ config }
                placeholder={ "kueda, 1001, etc." }
              />
              { !_.isEmpty( project.userRules ) && (
                <div className="icon-previews">
                  { _.map( project.userRules, userRule => (
                    <div className="badge-div" key={ `user_rule_${userRule.user.id}` }>
                      <span className="badge">
                        { userRule.user.login }
                        <i
                          className="fa fa-times-circle-o"
                          onClick={ ( ) => removeProjectRule( userRule ) }
                        />
                      </span>
                    </div>
                  ) ) }
                </div>
              ) }
            </Col>
          </Row>
          <Row>
            <Col xs={4}>
              <label>Data Quality</label>
              <input
                type="checkbox"
                id="project-quality-research"
                name="quality_grade"
                value="research"
                defaultChecked={ project.rule_quality_grade.research }
                onChange={ ( ) => setRulePreference( "quality_grade", this.qualityGradeValues( ) ) }
              />
              <label className="inline" htmlFor="project-quality-research">Research</label>
              <input
                type="checkbox"
                id="project-quality-needs-id"
                name="quality_grade"
                value="needs_id"
                defaultChecked={ project.rule_quality_grade.needs_id }
                onChange={ ( ) => setRulePreference( "quality_grade", this.qualityGradeValues( ) ) }
              />
              <label className="inline" htmlFor="project-quality-needs-id">Needs ID</label>
              <input
                type="checkbox"
                id="project-quality-casual"
                name="quality_grade"
                value="casual"
                defaultChecked={ project.rule_quality_grade.casual }
                onChange={ ( ) => setRulePreference( "quality_grade", this.qualityGradeValues( ) ) }
              />
              <label className="inline" htmlFor="project-quality-casual">Casual</label>
            </Col>
            <Col xs={4}>
              <label>Media Type</label>
              <input
                type="checkbox"
                id="project-media-sounds"
                defaultChecked={ project.rule_sounds }
                onChange={ e => setRulePreference( "sounds", e.target.checked ? "true" : null ) }
              />
              <label className="inline" htmlFor="project-media-sounds">Has Sound</label>
              <input
                type="checkbox"
                id="project-media-photos"
                defaultChecked={ project.rule_photos }
                onChange={ e => setRulePreference( "photos", e.target.checked ? "true" : null ) }
              />
              <label className="inline" htmlFor="project-media-photos">Has Photo</label>
            </Col>
          </Row>
          <Row className="date-row">
            <Col xs={12}>
              <label>Date Observed</label>
              <input
                type="radio"
                name="project-date-type-any"
                inputProps
                checked={ project.date_type === "any" }
                onChange={ ( ) => updateProject( { date_type: "any" } ) }
              />
              <label className="inline" htmlFor="project-date-type-any">Any</label>
              <input
                type="radio"
                name="project-date-type-exact"
                checked={ project.date_type === "exact" }
                onChange={ ( ) => updateProject( { date_type: "exact" } ) }
              />
              <label className="inline" htmlFor="project-date-type-exact">Exact</label>
              <DateTimeFieldWrapper
                mode="date"
                inputFormat="YYYY-MM-DD"
                defaultText={ project.rule_observed_on }
                onChange={ date => setRulePreference( "observed_on", date ) }
                inputProps={ {
                  className: "form-control",
                  placeholder: "YYYY-MM-DD"
                } }
              />
              <input
                type="radio"
                name="project-date-type-range"
                value="regular"
                checked={ project.date_type === "exact" }
                onChange={ ( ) => updateProject( { date_type: "exact" } ) }
              />
              <label className="inline" htmlFor="project-date-type-range">Range</label>
              <DateTimeFieldWrapper
                mode="datetime"
                inputFormat="YYYY-MM-DD HH:mm Z"
                defaultText={ project.rule_d1 }
                onChange={ date => setRulePreference( "d1", date ) }
                inputProps={ {
                  className: "form-control",
                  placeholder: "Start Date / Time"
                } }
              />
              <DateTimeFieldWrapper
                mode="datetime"
                inputFormat="YYYY-MM-DD HH:mm Z"
                defaultText={ project.rule_d2 }
                onChange={ date => setRulePreference( "d2", date ) }
                inputProps={ {
                  className: "form-control",
                  placeholder: "End Date / Time"
                } }
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

RegularForm.propTypes = {
  config: PropTypes.object,
  project: PropTypes.object,
  addProjectRule: PropTypes.func,
  removeProjectRule: PropTypes.func,
  setRulePreference: PropTypes.func,
  updateProject: PropTypes.func
};

export default RegularForm;

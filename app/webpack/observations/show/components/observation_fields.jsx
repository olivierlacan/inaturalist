import _ from "lodash";
import React from "react";
import PropTypes from "prop-types";
import { Panel } from "react-bootstrap";
import ObservationFieldValue from "./observation_field_value";
import ObservationFieldInput from "./observation_field_input";

class ObservationFields extends React.Component {
  constructor( props ) {
    super( props );
    const { config, observation } = props;
    this.observerPrefersFieldsBy = ( observation.user.preferences
      && observation.user.preferences.prefers_observation_fields_by )
      ? observation.user.preferences.prefers_observation_fields_by
      : "anyone";
    const currentUser = config && config.currentUser;
    this.state = {
      open: currentUser ? !currentUser.prefers_hide_obs_show_observation_fields : true,
      editingFieldValue: null
    };
  }

  render( ) {
    const {
      observation,
      config,
      addObservationFieldValue,
      updateObservationFieldValue,
      collapsible,
      updateSession
    } = this.props;
    const {
      editingFieldValue,
      open
    } = this.state;
    const loggedIn = config && config.currentUser;
    if ( !observation || !observation.user || ( _.isEmpty( observation.ofvs ) && !loggedIn ) ) {
      return ( <span /> );
    }
    const sortedFieldValues = _.sortBy( observation.ofvs, ofv => (
      `${ofv.value ? "a" : "z"}:${ofv.name}:${ofv.value}`
    ) );
    let addValueInput;
    if ( loggedIn ) {
      let disabled = false;
      let placeholder;
      const viewerIsObserver = config.currentUser.id === observation.user.id;
      const viewerIsCurator = config.currentUser.roles.indexOf( "curator" ) >= 0;
      if ( this.observerPrefersFieldsBy === "observer" && !viewerIsObserver ) {
        disabled = true;
        placeholder = "Observer does not allow addition of observation fields";
      } else if ( this.observerPrefersFieldsBy === "curators" && !viewerIsObserver && !viewerIsCurator ) {
        disabled = true;
        placeholder = "Observer only allows curators to add observation fields";
      }
      addValueInput = (
        <div className="form-group">
          <ObservationFieldInput
            notIDs={
              _.compact( _.uniq( _.map( observation.ofvs, ofv => (
                ofv.observation_field && ofv.observation_field.id ) ) ) )
            }
            onSubmit={r => {
              addObservationFieldValue( r );
            }}
            placeholder={placeholder}
            config={config}
            disabled={disabled}
          />
        </div>
      );
    }
    const panelContent = (
      <div>
        { sortedFieldValues.map( ofv => {
          if ( editingFieldValue && editingFieldValue.uuid === ofv.uuid ) {
            return (
              <ObservationFieldInput
                observationField={ofv.observation_field}
                observationFieldValue={ofv.value}
                observationFieldTaxon={ofv.taxon}
                key={`editing-field-value-${ofv.uuid}`}
                setEditingFieldValue={fieldValue => {
                  this.setState( { editingFieldValue: fieldValue } );
                }}
                editing
                originalOfv={ofv}
                hideFieldChooser
                onCancel={( ) => {
                  this.setState( { editingFieldValue: null } );
                }}
                onSubmit={r => {
                  if ( r.value !== ofv.value ) {
                    updateObservationFieldValue( ofv.uuid, r );
                  }
                  this.setState( { editingFieldValue: null } );
                }}
              />
            );
          }
          return (
            <ObservationFieldValue
              ofv={ofv}
              key={`field-value-${ofv.uuid || ofv.observation_field.id}`}
              setEditingFieldValue={fieldValue => {
                this.setState( { editingFieldValue: fieldValue } );
              }}
              {...this.props}
            />
          );
        } ) }
        { addValueInput }
      </div>
    );

    if ( !collapsible ) {
      return (
        <div className="ObservationFields">
          { panelContent }
        </div>
      );
    }

    const count = sortedFieldValues.length > 0 ? `(${sortedFieldValues.length})` : "";
    return (
      <div className="ObservationFields collapsible-section">
        <h4
          className="collapsible"
          onClick={( ) => {
            if ( loggedIn ) {
              updateSession( {
                prefers_hide_obs_show_observation_fields: open
              } );
            }
            this.setState( { open: !open } );
          }}
        >
          <i className={`fa fa-chevron-circle-${open ? "down" : "right"}`} />
          { I18n.t( "observation_fields" ) }
          { " " }
          { count }
        </h4>
        <Panel expanded={open} onToggle={() => {}}>
          <Panel.Collapse>{ panelContent }</Panel.Collapse>
        </Panel>
      </div>
    );
  }
}

ObservationFields.propTypes = {
  config: PropTypes.object,
  observation: PropTypes.object,
  addObservationFieldValue: PropTypes.func,
  removeObservationFieldValue: PropTypes.func,
  updateObservationFieldValue: PropTypes.func,
  updateSession: PropTypes.func,
  collapsible: PropTypes.bool
};

ObservationFields.defaultProps = {
  collapsible: true
};

export default ObservationFields;

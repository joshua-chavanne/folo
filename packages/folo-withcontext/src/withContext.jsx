import React from "react";

/**
 * HOC component
 * Connect component to props
 *
 * @param {Component} targeted_component
 * @param {Component} consumer_context
 * @param {Array} contextProps contains props required from consumer
 * @return {Component} - new component connected to context props
 */
function withcontext({ Component, Consumer, contextProps = [] } = {}) {
  return function ComponentWithContext(props) {
    return (
      <Consumer>
        {context => {
          let cn;
          /**
           * if contextProps length is zero, pass all context props
           * otherwise extract the required props
           */
          if (contextProps.length > 0) {
            const obj = {};
            contextProps.forEach(prop => {
              obj[prop] = context[prop];
            });
            cn = obj;
          } else {
            cn = context;
          }
          return <Component {...props} {...cn} />;
        }}
      </Consumer>
    );
  };
}

export default withcontext;
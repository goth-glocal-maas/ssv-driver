import React from 'react';
import {ActivityIndicator, Alert, TouchableOpacity, Text} from 'react-native';
import gql from 'graphql-tag';
import {useMutation} from '@apollo/react-hooks';

const ACCEPT_JOB_MUTATION = gql`
  mutation ACCEPT_JOB_MUTATION(
    $jobID: smallint
    $userID: uuid
    $now: timestamptz
  ) {
    update_trip(
      where: {id: {_eq: $jobID}}
      _set: {driver_id: $userID, accepted_at: $now}
    ) {
      affected_rows
      returning {
        id
        driver {
          username
        }
        accepted_at
      }
    }
  }
`;

export default function AccepJobButton({jobID, userID}) {
  const [processing, setProcessing] = React.useState(false);
  const [accept_job, {loading, error}] = useMutation(ACCEPT_JOB_MUTATION);
  // refetch should not be ncessary since it's subscription thing
  let buttontext = (
    <Text
      style={[
        {
          color: 'white',
          fontSize: 36,
        },
      ]}>
      START
    </Text>
  );
  if (loading) {
    buttontext = <ActivityIndicator />;
  } else if (error) {
    buttontext = (
      <Text
        style={[
          {
            color: 'white',
            fontSize: 20,
          },
        ]}>
        {error.message}
      </Text>
    );
  }

  React.useEffect(() => {
    if (!loading && processing) {
      setTimeout(() => {
        setProcessing(false);
      }, 300);
    }
  }, [loading]);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: error ? '#f43030' : '#15c146',
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      disabled={processing || loading || error}
      onPress={() => {
        const variables = {
          jobID,
          userID,
          now: new Date(),
        };
        console.log('press: accepting job', variables);
        accept_job({
          variables,
        })
          .then(res => {
            console.log('done: accepting job', res);
            console.log(res.data.update_trip.returning);
          })
          .catch(err => {
            console.log('err: ', err);
          })
          .finally(() => {
            console.log('finally');
          });
      }}>
      {buttontext}
    </TouchableOpacity>
  );
}
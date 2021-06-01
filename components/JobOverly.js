import { useMutation, useSubscription } from '@apollo/react-hooks';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { hhmmDuration } from '../libs/day';

const GREEN = 'rgba(68, 252, 148, 0.3)';
const YELLOW = 'rgba(252, 186, 3, 0.5)';
const RED = 'rgba(249, 88, 67, 0.5)';

export default function JobOverlay({ isWorking, setWorking }) {
  const { data, loading } = useSubscription(ACTIVE_WORKING_SHIFT)
  const [shiftID, setShiftID] = useState(-1)
  const [shiftDuration, setShiftDuration] = useState('')
  const [
    startWorking,
    { loading: startLoading, error: startError },
  ] = useMutation(START_WORKING_MUTATION);
  const [endWorking, { loading: endLoading, error: endError }] = useMutation(
    END_WORKING_MUTATION,
  );
  const [
    updateWorking,
    { loading: updateLoading, error: updateError },
  ] = useMutation(UPDATE_WORKING_MUTATION);

  useEffect(() => {
    if (loading) return
    if (data.working_shift.length > 0) {
      setWorking(true);
      const item = data.working_shift[0]
      setShiftID(item.id)
    }
  }, [data, loading])

  useEffect(() => {
    const timer = setInterval(() => {
      if (shiftID > -1 && !loading && data.working_shift.length > 0) {
        const start = dayjs(data.working_shift[0].start)
        setShiftDuration(hhmmDuration(start, dayjs()))
      }
    }, 1000);
    // clearing interval
    return () => clearInterval(timer);
  });

  return (
    <View style={styles.container}>
      {!isWorking && (
        <View
          style={[
            styles.rowFlex,
            {
              width: '100%',
              justifyContent: 'flex-end',
              alignContent: 'stretch',
            },
          ]}>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={{
                backgroundColor: '#15c146',
                height: 55,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={async () => {
                const variables = { vehicleID: 1 }
                const res = await startWorking({ variables });
                console.log('start working: ', res);
                const { id } = res.data.insert_working_shift_one
                setShiftID(id)
                setWorking(true);
              }}>
              <Text>Start working</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {isWorking && shiftID > -1 && (
        <>
          <Text style={styles.timer}>
            {shiftDuration}
          </Text>
          <Icon
            raised
            name="pause-outline"
            type="ionicon"
            containerStyle={{ backgroundColor: '#000000' }}
            onPress={async () => {
              const variables = {
                ID: shiftID,
                timestamp: dayjs().format(),
              };
              const res = await endWorking({ variables });
              console.log('end working: ', res);
              setShiftID(-1)
              setShiftDuration('')
              setWorking(false);
            }}
          />
        </>
      )}
      <View style={{ width: 10 }} />
    </View>
  );
}
``;

const ACTIVE_WORKING_SHIFT = gql`
subscription ACTIVE_WORKING_SHIFT {
  working_shift(where:{
    end: {_is_null:true}
  }) {
    id
    start
    vehicle_id
  }
}
`


const START_WORKING_MUTATION = gql`
  mutation START_WORKING_MUTATION($vehicleID: Int) {
    insert_working_shift_one(object: {vehicle_id: $vehicleID}) {
      id
    }
  }
`;

const UPDATE_WORKING_MUTATION = gql`
  mutation UPDATE_WORKING_MUTATION($ID: bigint!, $point: geometry!, $timestamp: timestamptz!) {
  update_working_shift_by_pk(
    pk_columns: {id: $ID},
    _set: {point: $point, latest_timestamp: $timestamp}
    ) {
    id
  }
}
`;

const END_WORKING_MUTATION = gql`
  mutation END_WORKING_MUTATION($ID: bigint!, $timestamp: timestamptz!) {
  update_working_shift_by_pk(
    pk_columns: {id: $ID},
    _set: {end: $timestamp}) {
    id
  }
}
`;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  colFlex: {
    flexDirection: 'column',
  },
  rowFlex: {
    flexDirection: 'row',
  },
  inputContainer: {
    flexGrow: 1,
  },
  input: {
    height: 40,
    paddingHorizontal: 5,
  },
  searchModeButton: {
    flex: 1,
    width: 50,
    justifyContent: 'space-around',
  },
  filtered: {
    borderRadius: 5,
    backgroundColor: YELLOW,
    paddingVertical: 4,
    paddingEnd: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    borderRadius: 10,
    backgroundColor: GREEN,
    paddingVertical: 4,
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'right',
  },
});

import React from 'react';
import './DateAndTimeTemplate.scss';
import dayjs from 'dayjs';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';

import calendarIcon from '../../assets/images/icons/calendarIcon.svg';

type Props = {
  value: any;
  label: string;
  onChange: Function;
  minDate?: any;
  maxDate?: any;
};

const DateTemplate = (props: Props) => {
  const { value, minDate, maxDate, label, onChange } = props;

  const handleChange = (newValue: any) => {
    onChange(newValue);
  };

  return (
    <div className="date-template">
      <div className="dt-label">{label}</div>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={value ? dayjs(value) : null}
          onChange={handleChange}
          minDate={minDate ? dayjs(minDate) : undefined}
          maxDate={maxDate ? dayjs(maxDate) : undefined}
          format="DD/MM/YYYY"
            enableAccessibleFieldDOMStructure={false}   // ✅ ADD THIS
          slots={{
            textField: (params) => (
              <TextField
                {...params}
                className="date-filter date-control"
                variant="standard"
                InputProps={{
                  ...params.InputProps,
                  disableUnderline: true,
                  readOnly: true,
                  endAdornment: (
                    <img
                      src={calendarIcon}
                      alt="calendar"
                      style={{ width: 20, cursor: 'pointer' }}
                    />
                  ),
                }}
              />
            ),
          }}
        />
      </LocalizationProvider>
    </div>
  );
};

export default DateTemplate;
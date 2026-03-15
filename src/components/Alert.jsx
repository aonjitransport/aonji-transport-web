import Alert from '@mui/material/Alert';

export function AlertComponent( {severity,message} ) {
  return (
    <Alert severity={severity}>{message}</Alert>
  );
}


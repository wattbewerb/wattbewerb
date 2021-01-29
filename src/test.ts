import { Einheit } from './makstr-client/einheit';

new Einheit().query('05166012').then((res) => {
  console.log(res);
  console.log(res.Data);
});

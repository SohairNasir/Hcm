import {useState,useEffect} from 'react';
import {Card,Stat,B,F,Sel,Bd,T,Bars,Grid,Filt,Ic,Logo,Cnt,LineC,Donut,Hero} from '../components/ui';
import {DEPT,EMP} from '../data';
function Slips(){return <Card t="My payslips"><T h={['Month','Gross','Net','']} rows={[['September 2026','150,000','147,500',<B v="p">⬇ PDF</B>],['August 2026','150,000','147,500',<B v="p">⬇ PDF</B>]]}/></Card>}
export default Slips;

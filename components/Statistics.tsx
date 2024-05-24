import React, { useState ,useRef, useEffect} from 'react';
import {Image,StyleSheet,Text,View,TouchableOpacity,SafeAreaView,ScrollView,DrawerLayoutAndroid, ToastAndroid} from 'react-native';
import ExpensesList from './ExpensesList';
import IncomesList from './IncomesList';
import BasicChart from './BasicChart';
import RNPrint from 'react-native-print';
import Drawer from './Drawer';
import apiUrl from '../Api';
interface DataItemExtreme {
  idExp:any;
  idCurr:any;
  category:any;
  amount: string;
  dateExpense: string;
  pdfFile: string;
  categoryName: string;
  categoryImage: string;
  mainCurrency: string;
  otherCurrencies: string;
}

interface DataItemExtremeInc {
  idInc:any;
  idCurr:any;
  category:any;
  amount: string;
  dateIncome: string;
  pdfFile: string;
  categoryName: string;
  categoryImage: string;
  mainCurrency: string;
  otherCurrencies: string;
}
interface DataItemCategory2 {
  key : string; 
  value: string;
  cselected?: boolean;
}

interface StatItem{
  name: string;
  pourcentage: number;
}
const Statistics=() =>{
  const [isExpensesActive, setIsExpensesActive] = useState<boolean>(true);
  const [isIncomesActive, setIsIncomesActive] = useState<boolean>(false);    
  const [isYearlyActive, setIsYearlyActive] = useState<boolean>(true);
  const [isMonthlyActive, setIsMonthlyActive] =  useState<boolean>(false)
  const [incomesData, setIncomesData] = useState<DataItemExtremeInc[]>([]);
  const [expensesData, setExpensesData] = useState<DataItemExtreme[]>([]);
  const [categoryData, setCategoryData] = useState<DataItemCategory2[]>([]);
  const [StatExpensesData, setStatExpensesData] = useState<StatItem[]>([]);
  const [StatIncomesData, setStatIncomesData] = useState<StatItem[]>([]);
  
  const showToastWithGravity = (text:string) => {
    ToastAndroid.showWithGravity(
      text,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
     
    );
  };
  useEffect(() => {
    displayExpensesTable();
    displayIncomesTable();
  }, []);

  useEffect(() => {
    fillCategoriesSelectList();
  }, []);

  useEffect(() => {
    if (isYearlyActive) {
      setStatExpensesData(generateStatExpensesDataYearly(expensesData));
    } else if (isMonthlyActive) {
      setStatExpensesData(generateStatExpensesDataMonthly(expensesData));
    }
  }, [expensesData, isYearlyActive, isMonthlyActive]);
  
  useEffect(() => {
    if (isYearlyActive) {
      setStatIncomesData(generateStatIncomesDataYearly(incomesData));
    } else if (isMonthlyActive) {
      setStatIncomesData(generateStatIncomesDataMonthly(incomesData));
    }
  }, [incomesData, isYearlyActive, isMonthlyActive]);
  
 // Yearly expenses
const generateStatExpensesDataYearly = (expensesData: DataItemExtreme[]): StatItem[] => {
  const statData: { [key: string]: { totalAmount: number, count: number, categoryName: string } } = {};

  expensesData.forEach((expense) => {
    const year = new Date(expense.dateExpense).getFullYear();
    const key = `${year}_${expense.categoryName}`;
    if (!statData[key]) {
      statData[key] = { totalAmount: 0, count: 0, categoryName: expense.categoryName };
    }
    statData[key].totalAmount += parseFloat(expense.amount);
    statData[key].count++;
  });
  const totalSum = Object.values(statData).reduce((sum, category) => sum + category.totalAmount, 0);
  const statExpensesData: StatItem[] = Object.entries(statData).map(([key, value]) => ({
    name: value.categoryName,
    pourcentage: parseFloat((value.totalAmount / totalSum * 100).toFixed(1)) || 0,
  }));

  return statExpensesData;
};

// Monthly Expenses
const generateStatExpensesDataMonthly = (expensesData: DataItemExtreme[]): StatItem[] => {
  const statData: { [key: string]: { totalAmount: number, count: number, categoryName: string } } = {};
  const uniqueCategories = new Set<string>();

  expensesData.forEach((expense) => {
    const month = new Date(expense.dateExpense).getMonth() + 1; 
    const key = `${month}_${expense.categoryName}`;

    if (!statData[key]) {
      statData[key] = { totalAmount: 0, count: 0, categoryName: expense.categoryName };
      uniqueCategories.add(expense.categoryName);
    }

    statData[key].totalAmount += parseFloat(expense.amount);
    statData[key].count++;
  });

  const totalSum = Array.from(uniqueCategories).reduce((sum, categoryName) => {
    const key = `${new Date().getMonth() + 1}_${categoryName}`;
    return sum + (statData[key]?.totalAmount || 0);
  }, 0);

  const statExpensesData: StatItem[] = Array.from(uniqueCategories).map((categoryName) => {
    const key = `${new Date().getMonth() + 1}_${categoryName}`;
    const value = statData[key];

    return {
      name: categoryName,
      pourcentage: parseFloat((value?.totalAmount / totalSum * 100).toFixed(1)) || 0,
    };
  });

  return statExpensesData;
};


// Yearly Incomes
const generateStatIncomesDataYearly = (incomesData: DataItemExtremeInc[]): StatItem[] => {
  const statData: { [key: string]: { totalAmount: number, count: number, categoryName: string } } = {};

  incomesData.forEach((income) => {
    const year = new Date(income.dateIncome).getFullYear();
    const key = `${year}_${income.categoryName}`;

    if (!statData[key]) {
      statData[key] = { totalAmount: 0, count: 0, categoryName: income.categoryName };
    }

    statData[key].totalAmount += parseFloat(income.amount);
    statData[key].count++;
  }); 
  const totalSum = Object.values(statData).reduce((sum, category) => sum + category.totalAmount, 0);
  const statIncomesData: StatItem[] = Object.entries(statData).map(([key, value]) => ({
    name: value.categoryName,
    pourcentage: parseFloat((value.totalAmount / totalSum * 100).toFixed(1)) || 0,
  }));

  return statIncomesData;
};

  
// Monthly Incomes
const generateStatIncomesDataMonthly = (incomesData: DataItemExtremeInc[]): StatItem[] => {
  const statData: { [key: string]: { totalAmount: number, count: number, categoryName: string } } = {};
  const uniqueCategories = new Set<string>();

  incomesData.forEach((income) => {
    const month = new Date(income.dateIncome).getMonth() + 1; 
    const key = `${month}_${income.categoryName}`;

    if (!statData[key]) {
      statData[key] = { totalAmount: 0, count: 0, categoryName: income.categoryName };
      uniqueCategories.add(income.categoryName);
    }

    statData[key].totalAmount += parseFloat(income.amount);
    statData[key].count++;
  });

  const totalSum = Array.from(uniqueCategories).reduce((sum, categoryName) => {
    const key = `${new Date().getMonth() + 1}_${categoryName}`;
    return sum + (statData[key]?.totalAmount || 0);
  }, 0);

  const statIncomesData: StatItem[] = Array.from(uniqueCategories).map((categoryName) => {
    const key = `${new Date().getMonth() + 1}_${categoryName}`;
    const value = statData[key];

    return {
      name: categoryName,
      pourcentage: parseFloat((value?.totalAmount / totalSum * 100).toFixed(1)) || 0,
    };
  });

  return statIncomesData;
};


const displayExpensesTable = async () => {
  try {
    const response = await fetch(`http://${apiUrl}:9090/user/expenseData`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      let newExpensesData : DataItemExtreme[] = [];
      newExpensesData= data.map((expense: any) => ({
        idExp: expense.idExp,
        idCurr: expense.idUser,
        category: expense.idCat,
        categoryName: expense.categoryName,
        amount: expense.amount,
        dateExpense: expense.dateExpense,
        pdfFile: expense.pdfFile,
        categoryImage: expense.categoryImage,      
        mainCurrency: expense.mainCurrency,
        otherCurrencies: expense.otherCurrencies,
      }));
      setExpensesData(newExpensesData);
    } else {
      const errorMessage = await response.text();
      console.error('Error fetching expenses data:', errorMessage);
      showToastWithGravity(`Failed to fetch expenses data: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error fetching expenses data:', error);
    showToastWithGravity('Failed to fetch expenses data');
  }
};
const fillCategoriesSelectList = async () => {
  try {
    const response = await fetch(`http://${apiUrl}:9090/categories/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      const categorydata2: DataItemCategory2[] = result.map((category: any) => ({
        key: category.idCat,
        value: category.categoryName,
      }));
      setCategoryData(categorydata2);
    } else {
      console.error('Error fetching categories:', response.statusText);
    }
  } catch (error) {
    console.error('Error displaying categories table: ', error);
  }
};

const displayIncomesTable = async () => {
  try {
    const response = await fetch(`http://${apiUrl}:9090/user/incomeData`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      let newIncomesData : DataItemExtremeInc[] = [];
      newIncomesData= data.map((income: any) => ({
        idExp: income.idExp,
        idCurr: income.idUser,
        category: income.idCat,
        categoryName: income.categoryName,
        amount: income.amount,
        dateIncome: income.dateIncome,
        pdfFile: income.pdfFile,
        categoryImage: income.categoryImage,      
        mainCurrency: income.mainCurrency,
        otherCurrencies: income.otherCurrencies,
      }));
      setIncomesData(newIncomesData);
    } else {
      const errorMessage = await response.text();
      console.error('Error fetching income data:', errorMessage);
      showToastWithGravity(`Failed to fetch income data: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error fetching income data:', error);
    showToastWithGravity('Failed to fetch income data');
  }
};
  
  const printHTML = async () => {
    const expensesRows = expensesData.map((item) => `
      <tr>
        <td style="text-align:center;">${item.amount}</td>
        <td style="text-align:center;">${item.dateExpense}</td>
        <td style="text-align:center;">${item.mainCurrency}</td>
      </tr>
    `).join('');

    const incomesRows=incomesData.map((item) => `
    <tr>
      <td style="text-align:center;">${item.amount}</td>
      <td style="text-align:center;">${item.dateIncome}</td>
      <td style="text-align:center;">${item.mainCurrency}</td>
    </tr>
  `).join('');

    const StatRowsExpenses = StatExpensesData.map((item) => `
    <tr>
      <td style="text-align:center;">${item.name}</td>
      <td style="text-align:center;">${item.pourcentage}</td>
    </tr>
  `).join('');

  const StatRowsIncomes = StatIncomesData.map((item) => `
    <tr>
      <td style="text-align:center;">${item.name}</td>
      <td style="text-align:center;">${item.pourcentage}</td>
    </tr>
  `).join('');

    const res:String=isYearlyActive?"Yearly":"Monthly";
    const tit:String=isExpensesActive?"Expenses":"Incomes";
    const sw=isExpensesActive?expensesRows:incomesRows;
    const st=isExpensesActive?StatRowsExpenses:StatRowsIncomes;

    let options = {
      html: `
        <h1 style="text-align:center;margin-bottom:8%;margin-top:8%">${tit} List</h1>
        <h2 style="text-align:center;margin-bottom:8%">${res}</h2>
        <table style="width:90%;border-collapse:collapse;margin-left:5%;margin-bottom:5%" border='1'>
          <tr>
            <th style="text-align:center;">Amount</th>
            <th style="text-align:center;">DateTime</th>
            <th style="text-align:center;">Currency</th>
          </tr>
          ${sw}
        </table>
        <h2 style="text-align:center;margin-bottom:8%">Statistics</h2>
        <table style="width:90%;border-collapse:collapse;margin-left:5%;margin-bottom:5%" border='1'>
          <tr>
            <th style="text-align:center;">Name</th>
            <th style="text-align:center;">Pourcentage</th>
          </tr>
          ${st}
        </table>
      `,
      fileName: 'Invoice',
      base64: true,
    };
  
    const file = await RNPrint.print(options);
  };

  const toggleExpenses = () => {
    setIsExpensesActive(true);
    setIsIncomesActive(false);
    console.log('Expenses button pressed');
  };
  const toggleIncomes = () => {
    setIsIncomesActive(true);
    setIsExpensesActive(false);
    console.log('Incomes button pressed');
  };
  const Style1 = {
    color: isExpensesActive ? 'white' : '#868686',
  };
  const Style2 = {
    color: isIncomesActive ? 'white' : '#868686',
  };

  const textStyle1= { ...Style1,flexDirection: 'row', fontWeight: 'bold', fontSize: 22, textAlign: 'center' };
  const textStyle2= { ...Style2,flexDirection: 'row', fontWeight: 'bold', fontSize: 22, textAlign: 'center' };

  const drawer = useRef<DrawerLayoutAndroid>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleDrawer = () => {
      if (drawer.current) {
        if (isDrawerOpen) {
          drawer.current.closeDrawer();
        } else {
          drawer.current.openDrawer();
        }
      }
    };

    const handleDrawerStateChange = (newState: 'Idle' | 'Dragging' | 'Settling') => {
      setIsDrawerOpen(newState !== 'Idle');
    };
    const closeDrawer = () => {
      if (drawer.current) {
        drawer.current.closeDrawer();
      }
    };

  const handleYearlyPress = () => {
    setIsYearlyActive(true);
    setIsMonthlyActive(false);
    console.log('Yearly button pressed');
  };

  const handleMonthlyPress = () => {
    setIsMonthlyActive(true);
    setIsYearlyActive(false);
    console.log('Monthly button pressed');
  };

  const Style3 = {
    color: isYearlyActive ? 'white' : 'black',
  };
  const Style4 = {
    color: isMonthlyActive ? 'white' : 'black',
  };

  const StyleSelected = {
    marginTop: '1%',
    backgroundColor: 'white',
    height: '30%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  };

  const textStyle3= { ...Style3, justifyContent: 'space-around', flexDirection: 'row', fontWeight: 'bold', fontSize: 22, textAlign: 'center',marginTop:'-3%' };
  const textStyle4= { ...Style4, justifyContent: 'space-around', flexDirection: 'row', fontWeight: 'bold', fontSize: 22, textAlign: 'center',marginTop:'-3%' };


  const ButtonStyle1={
    marginRight:'1%',
    marginTop:20,
    width: '41%',
    backgroundColor: '#4169E1',
    borderRadius:50,
    height: '80%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  }

  const ButtonStyle2={
    marginRight:'1%',
    marginTop:20,
    width: '41%',
    color:'#868686',
  }
  

  return (
      <SafeAreaView style={styles.background}>
        {/**Partie Header */}
        <DrawerLayoutAndroid
        ref={drawer}
        drawerWidth={300}
        drawerPosition="left"
        onDrawerStateChanged={handleDrawerStateChange}
        renderNavigationView={() => <Drawer closeDrawer={closeDrawer} />}>
    <View style={{ backgroundColor: '#4169E1', justifyContent: 'center', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, height: '10.5%', alignItems: 'center' }}>
      <SafeAreaView style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', height: '40%', width: '95%', marginTop: '3%' ,marginLeft: '5%'}}>
        <TouchableOpacity onPress={toggleDrawer}>
          <Image source={require('../assets/humbergerMenu.png')} style={styles.icons} />
        </TouchableOpacity>

        <Image source={require('../assets/singleMan.png')} style={styles.singleMan} />
        <Text style={{ fontWeight: 'bold', fontSize: 25, color: 'black', marginRight: '50%', paddingBottom: '1%' }}>Statistics</Text>
      </SafeAreaView>

      <View style={{width: '100%', height: '50%', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, justifyContent: 'space-around', flexDirection: 'row', alignItems: 'center' }}>

        <TouchableOpacity onPress={handleYearlyPress} style={styles.button2}>
          <Text style={textStyle3}>Yearly</Text>
          <View style={isYearlyActive ? StyleSelected : {}}></View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleMonthlyPress} style={styles.button2}>
          <Text style={textStyle4}>Monthly</Text>
          <View style={isMonthlyActive ? StyleSelected : {}}></View>
        </TouchableOpacity>
      </View>
    </View>
    {/**Fin partie Header */}
        <SafeAreaView style={styles.container}>
          <View style={{width: '95%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around',height:'7%' }}>

              <TouchableOpacity onPress={toggleExpenses} style={isExpensesActive ? ButtonStyle1 : ButtonStyle2}>
                <Text style={textStyle1}>Expenses</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleIncomes} style={isIncomesActive ? ButtonStyle1 : ButtonStyle2}>
                <Text style={textStyle2}>Incomes</Text>
              </TouchableOpacity>
          </View>

          <View style={{ width: '100%', alignItems: 'center', marginTop: '5%' }}>
          <Text style={{ color: '#735757', fontSize: 20, fontWeight: 'bold' }}>
              Total {isExpensesActive ? 'expenses' : 'incomes'}
            </Text>
          </View>

          {isIncomesActive ? <BasicChart StatData={StatIncomesData} /> : <BasicChart StatData={StatExpensesData} />}

          {isExpensesActive?(
          <View style={{ width: '100%', alignItems: 'center',backgroundColor:'#4169E1',borderTopLeftRadius: 25, borderTopRightRadius: 25,height:210 }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: '1%', textAlign: 'center', marginBottom: '0%' }}>
              List of {isExpensesActive ? 'expenses' : 'incomes'}
            </Text>
            <ScrollView horizontal={false} showsVerticalScrollIndicator={true}> 
             <ExpensesList expensesData={expensesData} CategoryData={categoryData} showButtons={false} selectedCurrency={0}/>
            </ScrollView>
          </View>
          ):
          <View style={{ width: '100%', alignItems: 'center',backgroundColor:'#4169E1',borderTopLeftRadius: 25, borderTopRightRadius: 25,height:210 }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: '1%', textAlign: 'center', marginBottom: '0%' }}>
            List of {isExpensesActive ? 'expenses' : 'incomes'}
          </Text>
          <ScrollView horizontal={false} showsVerticalScrollIndicator={true}> 
           <IncomesList incomesData={incomesData} CategoryData={categoryData} showButtons={false} selectedCurrency={0}/>
          </ScrollView>
        </View>
        }

          <TouchableOpacity  onPress={printHTML} style={styles.button}>
          <Text style={styles.buttonText} >Print</Text>
          </TouchableOpacity>
        </SafeAreaView>
        </DrawerLayoutAndroid>
      </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%',
    height: '69.7%',
    marginTop: '2.5%',
    alignContent: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#FFFFFF', 
    paddingTop: 11,
    fontFamily: 'Verdana',
    textAlign: 'center',
  },

  background: {
    height: 1000,
    backgroundColor: 'white',
  },
  button: {
    width: '40%',
    height: 50,
    marginTop: '5%',
    backgroundColor: '#4169E1',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  button2: {
    width: '40%',
    height: '80%',
    marginTop: '4%'
  },
  icons: {
    width: 35,
    height: 35,
  },
  singleMan: {
    width: 30,
    height: 30,
    marginBottom: '1.5%',
    marginLeft: '17%',
    marginRight: '4%',
  },
});

export default Statistics;



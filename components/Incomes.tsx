import React, { useState, useRef, useEffect, createContext } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, DrawerLayoutAndroid, TextInput, Modal, Button, RefreshControl,ToastAndroid, Platform } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import IncomesList from './IncomesList';
import Drawer from './Drawer';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker, { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import {heightPercentageToDP as hp } from 'react-native-responsive-screen';
import apiUrl from '../Api';
interface DataItem {
  idExp:any;
  idCurr:any;
  category:any;
  amount: string;
  dateIncome: string;
  pdfFile: string;
}
interface DataItemExtreme {
  idExp:any;
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
interface DataItemCategory {
  idCat : any; 
  categoryName: string;
  categoryImage: string;
}
interface DataItemCategory2 {
  key : any; 
  value: string;
  selected?: boolean;
}

interface DataItemCurrency {
  id : any; 
  mainCurrency: string;
  otherCurrencies: string;
}

const Incomes = () => {
  const [incomesData, setIncomesData] = useState<DataItemExtreme[]>([]);
  const [CategoryData, setCategoryData] = useState<DataItemCategory[]>([]);
  const [CategoryData2, setCategoryData2] = useState<DataItemCategory2[]>([]);
  const [CurrencyData, setCurrencyData] = useState<DataItemCurrency[]>([])
  const [selectedIdCategory, setSelectedIdCategory] = useState<number | undefined>();
  const [selectedIdCurrency, setSelectedIdCurrency] = useState<number | undefined>();
  
  const [pathPdf,setPathPdf]=useState<string>('')
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [newIncome, setNewIncome] = useState<DataItem | null>(null);
  const [newAmount, setNewAmount] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const drawer = useRef<DrawerLayoutAndroid>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  let MyPath:any[]=[]
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      displayIncomesTable();
    }, 1000);
  }, []);

  useEffect(() => {
    displayIncomesTable();
  }, []);

  useEffect(() => {
    displayWelcomeTable();
    fillCategoriesSelectList();
  }, []);

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
        let newIncomesData : DataItemExtreme[] = [];
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

  const showToastWithGravity = (text:string) => {
    ToastAndroid.showWithGravity(
      text,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
     
    );
  };
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

  const handleSaveNewIncome = async () => {
    try {
      if (!newAmount || !selectedIdCategory || !pathPdf) {
        showToastWithGravity('Data required.');
        return;
      }
     
  
      const fileUri = pathPdf.replace('file://', '');
        const fileContent = await RNFS.readFile(fileUri, 'base64');
        //console.log('pathPdf : ',fileContent)
        await displayCategoriesTable(selectedIdCategory);
        const newIncomeData = {
            amount: newAmount,
            dateIncome: concatenateDateTime(selectedDate, selectedTime),
            pdfFile: fileContent,
            welcomeEntity: { id: selectedIdCurrency },
            categoryEntity: { idCat: selectedIdCategory }
        };

        //console.log("newIncomeData : ",newIncomeData);
  
      const response = await fetch(`http://${apiUrl}:9090/incomes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIncomeData),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Error adding Income:', errorMessage);
        showToastWithGravity('Failed to add income');
      } else {
        const insertedIncome = await response.json();
        console.log('Inserted income:', insertedIncome); // Log the response here
      }
  
      if (response.ok) {
        const insertedIncome = await response.json();
        
        const newIncome = {
          idExp: insertedIncome.idExp,
          amount: newAmount,
          dateIncome: concatenateDateTime(selectedDate, selectedTime),
          pdfFile: pathPdf,
          idCurr: selectedIdCurrency,
          category: selectedIdCategory,
          categoryImage: CategoryData.length > 0 ? CategoryData[0].categoryImage : '',
          categoryName: CategoryData.length > 0 ? CategoryData[0].categoryName : '',
          mainCurrency: CurrencyData.length > 0 ? CurrencyData[0].mainCurrency : '',
          otherCurrencies: CurrencyData.length > 0 ? CurrencyData[0].otherCurrencies : '',
        };
  
        setNewAmount('');
        setAddModalVisible(false);
        showToastWithGravity('Income Added Successfully!');
        displayIncomesTable();
      } else {
        const errorMessage = await response.text();
        console.error('Error adding income:', errorMessage);
        showToastWithGravity('Failed to add income');
      }
    } catch (error) {
      console.error('Error inserting income:', error);
      showToastWithGravity('Failed to add income');
    }
  };
  const fillCategoriesSelectList = async () => {
    try {
      const response = await fetch(`http://${apiUrl}:9090/categories/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        let categoryData2: DataItemCategory2[] = [];
        data.forEach((item: any) => {
          categoryData2.push({
            key: item.idCat,
            value: item.categoryName,
          });
        });
        setCategoryData2(categoryData2); 
      } else {
        const errorMessage = await response.text();
        console.error('Error fetching categories data:', errorMessage);
      }
    } catch (error) {
      console.error('Error fetching categories data:', error);
    }
  };
  const displayCategoriesTable = async (id: any): Promise<void> => {
    try {
      const response = await fetch(`http://${apiUrl}:9090/categories/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        const category = data.find((item: any) => item.idCat === id);
  
        if (category) {
          let categoryData: DataItemCategory[] = [];
          categoryData.push({
            idCat: category.idCat,
            categoryName: category.categoryName,
            categoryImage: category.categoryImage,
          });
          setCategoryData(categoryData); 
        } else {
          console.error('No data found for the given id.');
        }
      } else {
        const errorMessage = await response.text();
        console.error('Error fetching categories data:', errorMessage);
      }
    } catch (error) {
      console.error('Error fetching categories data:', error);
    }
  };

  const displayWelcomeTable = async () => {
    try {
      const response = await fetch(`http://${apiUrl}:9090/user/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        let currencies : DataItemCurrency[] = [];
        currencies= data.map((user: any) => ({
          id: user.id,
          mainCurrency: user.mainCurrency,
          otherCurrencies: user.otherCurrencies,
        }));
        setCurrencyData(currencies);
        if (currencies.length > 0) {
          setSelectedIdCurrency(currencies[0].id);
        }
      } else {
        const errorMessage = await response.text();
        console.error('Error fetching user data:', errorMessage);
        showToastWithGravity(`Failed to fetch user data: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      showToastWithGravity('Failed to fetch user data');
    }
  };
  

  const AddPDF = async () => {
    try {
      const docs = await DocumentPicker.pick({
        type: DocumentPicker.types.pdf,
        copyTo: 'cachesDirectory',
      });
      if (docs?.length) {
        const uri = docs[0]?.fileCopyUri || '';
        MyPath.push(uri);
        let ind=MyPath.indexOf(uri);
        setPathPdf(uri);
        showToastWithGravity('PDF picked succesfully');
      }
    } catch (e) {
      console.log(e);
    }
  };
  const showTimePickerHandler = () => {
    setShowTimePicker(true);
  };

  const showDatePickerVisible = () => {
    setIsDatePickerVisible(true);
  };

  const handleDateChange = (_event: any, newDate: any) => {
    setIsDatePickerVisible(Platform.OS === 'ios');
    if (newDate) {
      setSelectedDate(newDate);
    }
  };
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  
  const concatenateDateTime = (selectedDate: Date, selectedTime: Date): string => {
    const formattedDate = formatDate(selectedDate);
    const formattedTime = formatTime(selectedTime);
    const combinedDateTime = `${formattedDate}T${formattedTime}`;
    const date = new Date(combinedDateTime);
    return date.toISOString();
  };

  
  const handleTimeChange = (_event: any, selectedDate: any) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };
  const handleCancelAdd = () => {
    setAddModalVisible(false);
    setNewIncome(null);
    setNewAmount('');
  };
  return (
    <SafeAreaView style={styles.background}>
      <DrawerLayoutAndroid
        ref={drawer}
        drawerWidth={300}
        drawerPosition="left"
        onDrawerStateChanged={handleDrawerStateChange}
        renderNavigationView={() => <Drawer closeDrawer={closeDrawer} />}>
        <View style={{ backgroundColor: '#4169E1', justifyContent: 'center', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, height: '11%', alignItems: 'center' }}>
          <SafeAreaView style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', height: '60%', width: '95%', marginBottom: '2%', marginLeft: '5%' }}>
            <TouchableOpacity onPress={toggleDrawer}>
              <Image source={require('../assets/humbergerMenu.png')} style={styles.icons} />
            </TouchableOpacity>
            <Image source={require('../assets/ShareMoneyDollar.png')} style={styles.ShareMoneyDollar} />
            <Text style={{ fontWeight: 'bold', fontSize: 25, color: 'black', marginRight: '50%',  }}>Incomes</Text>
          </SafeAreaView>
        </View>
        <View style={styles.container}>
          <View style={{ width: '100%', height: '75%' }}>
            <ScrollView horizontal={false} showsVerticalScrollIndicator={true} refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <IncomesList incomesData={incomesData} CategoryData={CategoryData2}  showButtons={true} selectedCurrency={selectedIdCurrency}/>
            </ScrollView>
          </View>
          <View style={{ width: '95%', alignItems: 'center', flexDirection: 'row', marginTop: '7%', justifyContent: 'center', }}>
            <TouchableOpacity style={styles.button} onPress={() => setAddModalVisible(true)}>
              <Text style={styles.buttonText}>Add</Text>
              <Image source={require('../assets/folder.png')} style={styles.iconFolder} />
            </TouchableOpacity>
          </View>
        </View>
        {/**Modal Add */}
        <Modal visible={addModalVisible} transparent animationType="slide">
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={{ color: 'black', fontWeight: 'bold', marginBottom: '20%', fontSize: 20, textAlign: 'center' }}>Add income</Text>
                  <TextInput
                    placeholder="Amount"
                    value={newAmount}
                    onChangeText={(text: any) => setNewAmount(text)}
                    keyboardType="numeric"
                    style={{
                      color:'white',
                      paddingLeft: 15,
                      backgroundColor: '#2196F5',
                      borderRadius: 2,
                      marginBottom: '7%',
                      elevation: 5,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 3,
                      height:44,
                    }}
                  />
                  <View style={{marginBottom:20}} >
                    <Button title={formatDate(selectedDate)} onPress={showDatePickerVisible} />

                    {isDatePickerVisible && (
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}/>)}

                  </View>

                  <View style={{marginBottom:20}}>
                    <Button title={formatTime(selectedTime)} onPress={()=>showTimePickerHandler()} />

                    {showTimePicker && (
                      <DateTimePicker
                        value={selectedTime}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={handleTimeChange}
                      />)}
                  </View>

                  <SelectList
                    data={CategoryData2}
                    save="key" 
                    placeholder='Category'
                    setSelected={(key: any) => setSelectedIdCategory(key)}
                    boxStyles={{
                      borderRadius: 2,
                      borderColor: '#2196F5',
                      borderStyle: 'solid',
                      backgroundColor: '#2196F5',
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                      height: 44,
                    }}
                    inputStyles={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}
                    dropdownTextStyles={{ color: 'black', fontWeight: 'bold' }}
                    badgeTextStyles={{ color: 'white', fontSize: 14 }}
                    badgeStyles={{ backgroundColor: '#2196F5' }}
                    labelStyles={{ color: 'white', fontWeight: 'bold', fontSize: 15, marginLeft: 2, borderRadius: 5 }}
                    dropdownItemStyles={{
                      backgroundColor: '#2196F5',
                      marginHorizontal: 6
                    }}
                    dropdownStyles={{
                      backgroundColor: '#2196F5',
                      borderRadius: 8,
                      borderColor: '#2196F5',
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.25,
                      shadowRadius: 8,
                      elevation: 5
                    }}
                  />

            <TouchableOpacity style={styles.buttonImport} onPress={AddPDF}>
              <Text style={styles.buttonImportText} >Pick PDF</Text>
              </TouchableOpacity>
                  <View style={{ flexDirection: 'row', width: '100%', height: '20%', alignItems: 'center', justifyContent: 'space-around' }}>
                    <TouchableOpacity onPress={handleSaveNewIncome} style={styles.SaveCancel}>
                      <Text style={styles.SaveCancelText} >Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCancelAdd} style={styles.SaveCancel}>
                      <Text style={styles.SaveCancelText} >Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
      </DrawerLayoutAndroid>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  buttonImport: {
    width: '100%',
    height: 44,
    marginTop: '7%',
    backgroundColor: '#2196F5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  container: {
    flexDirection: 'column',
    marginTop: '9%',
    width: '100%',
    height: '90%',
    alignContent: 'center',
  },
  SaveCancel: {
    alignContent:'center',
    alignItems:'center',
    width: '40%',
    height: 44,
    backgroundColor: '#2196F5',
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    }, 
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  SaveCancelText: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#FFFFFF', 
    textAlign: 'center',
    paddingTop:6,
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    padding: 20,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 23,
    color: '#FFFFFF',
    paddingTop: 12,
    fontFamily: 'Verdana',
    marginLeft: '5%'
  },
  buttonImportText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#FFFFFF', 
    paddingTop: 10,
    fontFamily: 'Verdana',
    textAlign: 'center',
  },
  icons: {
    width: 35,
    height: 35,
  },
  iconFolder: {
    width: 25,
    height: 25,
    marginLeft: '10%',
    marginTop: '8%'
  },
  ShareMoneyDollar: {
    width: 30,
    height: 30,
    marginLeft: '17%',
    marginRight: '4%',
  },
  background: {
    height: hp('100%'),
    backgroundColor: 'transparent',
  },
  button: {
    marginLeft:'5%',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '45%',
    height: 55,
    marginTop: '1%',
    backgroundColor: '#4169E1',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

});

export default Incomes;
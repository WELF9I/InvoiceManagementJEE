import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text, Modal, TouchableOpacity, TextInput, Button, Platform, ToastAndroid, SafeAreaView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { convert } from 'react-native-pdf-to-image';
import { SelectList } from 'react-native-dropdown-select-list';
import DocumentPicker from 'react-native-document-picker';
import { formatCurrency } from 'react-native-format-currency';
import axios from 'axios';
import apiUrl from '../Api';
interface DataItemExtreme {
  idExp: any;
  idCurr: any;
  category: any;
  amount: string;
  dateExpense: string;
  pdfFile: string;
  categoryName: string;
  categoryImage: string;
  mainCurrency: string;
  otherCurrencies: string;
}

interface DataItemCategory2 {
  key: string;
  value: string;
  cselected?: boolean;
}  

const ExpensesList: React.FC<{ expensesData: DataItemExtreme[]; CategoryData: DataItemCategory2[]; showButtons: boolean; selectedCurrency: any }> = ({ expensesData, CategoryData, showButtons, selectedCurrency }) => {
  const [CategoriesData2, setCategoriesData2] = useState<DataItemCategory2[]>([]);
  const [ExpensesData, setExpensesData] = useState<DataItemExtreme[]>([]);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [editedExpense, setEditedExpense] = useState<DataItemExtreme | null>(null);
  const [editedAmount, setEditedAmount] = useState<string>('');
  const [pdfModalVisible, setPdfModalVisible] = useState<boolean>(false);
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editedPdf, setEditedPdf] = useState<string>('');
  const [selectedIdCategory, setSelectedIdCategory] = useState<any>();
  const [selectedIdCurrency, setSelectedIdCurrency] = useState<any>();
  const [exchangeRates, setExchangeRates] = useState<any>({});
  const [maincurrency, setmaincurrency] = useState<string>('');

  let MyPath: any[] = [];
  const DefineMainCurrency = () => {
    ExpensesData.forEach((expense: DataItemExtreme) => {
      if (expense.mainCurrency && expense.mainCurrency !== '') {
        setmaincurrency(expense.mainCurrency);
        return;
      }
    });
  };
    
  useEffect(() => {
    DefineMainCurrency();
  }, [ExpensesData]); 
  
  useEffect(() => {
    if (maincurrency) {
      fetchExchangeRates(); 
    }
  }, [maincurrency]); 

  useEffect(() => {
    setExpensesData(expensesData);
  }, [expensesData]);
  
  useEffect(() => {
    setCategoriesData2(CategoryData);
  }, [CategoryData]);

  useEffect(() => {
    setSelectedIdCurrency(selectedCurrency);
  }, [selectedCurrency]);


  const fetchExchangeRates = async () => {
    try {
      const currencyUrls: {
        [key: string]: string; 
        GBP: string;
        USD: string;
        EUR: string;
        default: string;
    } = {
      GBP: 'https://v6.exchangerate-api.com/v6/ffd4028a14d09abe8c6bf367/latest/GBP',
      USD: 'https://v6.exchangerate-api.com/v6/ffd4028a14d09abe8c6bf367/latest/USD',
      EUR: 'https://v6.exchangerate-api.com/v6/ffd4028a14d09abe8c6bf367/latest/EUR',
      default: 'https://v6.exchangerate-api.com/v6/ffd4028a14d09abe8c6bf367/latest/TND'
    };
      const res = currencyUrls[maincurrency] || currencyUrls.default;
      const API = await axios.get(res);
      setExchangeRates(API.data.conversion_rates);
    } catch (error) {
      console.error('Error fetching exchange rates: ', error);
    }
  };
  

  const convertToOtherCurrencies = (amount: number, currency: string): string => {
    const rate = exchangeRates[currency];
    if (rate) {
      const convertedAmount = amount * rate;
      const amountString = convertedAmount.toString();
      const commaIndex = amountString.indexOf('.');
      const firstDigitAfterComma = amountString.substring(commaIndex + 1, commaIndex + 3);
      const formattedAmount = amountString.substring(0, commaIndex + 1) + firstDigitAfterComma;
      return formatCurrency({ amount: Number(formattedAmount), code: currency })[0].toString();
    }  
    return '';
  };
  

  const showToastWithGravity = (text: string) => {
    ToastAndroid.showWithGravity(
      text,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    );
  };

  const Delete = async (id: number) => {
    try {
      const response = await fetch(`http://${apiUrl}:9090/expenses/${id}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        console.log('Expense deleted successfully!');
        showToastWithGravity('Expense deleted successfully!');
      } else {
        const errorMessage = await response.text();
        console.error('Error deleting expense:', errorMessage);
        showToastWithGravity('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      showToastWithGravity('Failed to delete expense');
    }
  };
  

  const handleDeleteExpense = (id: number, index: number) => {
    const newExpenses = [...ExpensesData];
    newExpenses.splice(index, 1);
    setExpensesData(newExpenses);
    Delete(id);
    showToastWithGravity('Expense deleted successfully!');
  };


  const handleSaveEditExpense = async () => {
    if (editedExpense) {
      try {
        const updatedExpenseData = {
          amount: editedAmount || editedExpense.amount,
          dateExpense: concatenateDateTime(selectedDate, selectedTime) || editedExpense.dateExpense,
          pdfFile: editedPdf || editedExpense.pdfFile,
          welcomeEntity: { id: selectedIdCurrency || editedExpense.idCurr },
          categoryEntity: { idCat: selectedIdCategory || editedExpense.category },
        };
  
        const response = await fetch(`http://${apiUrl}:9090/expenses/${editedExpense.idExp}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedExpenseData),
        });
  
        if (response.ok) {
          console.log('Expense updated successfully!');
          const updatedExpenses = ExpensesData.map((expense) => {
            if (expense.idExp === editedExpense.idExp) {
              return {
                ...expense,
                amount: updatedExpenseData.amount,
                dateExpense: updatedExpenseData.dateExpense,
                pdfFile: updatedExpenseData.pdfFile,
                idCurr: updatedExpenseData.welcomeEntity.id,
                category: updatedExpenseData.categoryEntity.idCat,
              };
            }
            return expense;
          });
  
          showToastWithGravity('Expense updated successfully!');
          setExpensesData(updatedExpenses);
          setEditModalVisible(false);
          setEditedExpense(null);
          setEditedAmount('');
          setEditedPdf('');
          setSelectedIdCurrency(null);
        } else {
          const errorMessage = await response.text();
          console.error('Error updating expense:', errorMessage);
          showToastWithGravity('Failed to update expense');
        }
      } catch (error) {
        console.error('Error updating expense:', error);
        showToastWithGravity('Failed to update expense');
      }
    }
  };
  

  const fetchPdfImages = async (path: string) => {
    try {
      const fixedPdfUri = path;
      const images = await convert(fixedPdfUri);
      if (images.outputFiles) {
        setPdfImages(images.outputFiles);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const EditPDF = async () => {
    try {
      const docs = await DocumentPicker.pick({
        type: DocumentPicker.types.pdf,
        copyTo: 'cachesDirectory',
      });
      if (docs?.length) {
        const uri = docs[0]?.fileCopyUri || '';
        MyPath.push(uri);
        let ind = MyPath.indexOf(uri);
        showToastWithGravity('PDF picked successfully');
        setEditedPdf(MyPath.join(";"));
      }
    } catch (e) {
      console.log(e);
    }
    return MyPath.join(";");
  };

  const handleEditExpense = (index: number) => {
    setEditedExpense(ExpensesData[index]);
    setEditedAmount(ExpensesData[index].amount);
    setEditedPdf(ExpensesData[index].pdfFile);
    setEditModalVisible(true);
  };

  const handleViewPdf = (path: string) => {
    setPdfModalVisible(true);
    fetchPdfImages(path);
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditedExpense(null);
    setEditedAmount('');
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

  const showDatePickerVisible = () => {
    setIsDatePickerVisible(true);
  };

  const handleDateChange = (event: any, newDate: any) => {
    setIsDatePickerVisible(Platform.OS === 'ios');
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const showTimePickerHandler = () => {
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, selectedDate: any) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };

  return (
    <View>
      {ExpensesData.length > 0 ? (
        ExpensesData.map((expense: any, index: any) => (
          <View key={index} style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <View style={styles.headerText}>
                <Text style={styles.cardHeaderText}>{expense.categoryName}</Text>
              </View>
              {showButtons && (
                <TouchableOpacity onPress={() => handleViewPdf(expense.pdfFile)}>
                  <Image source={require('../assets/viewIcon.png')} style={styles.viewIcon} />
                </TouchableOpacity>
              )}
              <Image source={{ uri: `data:image/png;base64,${expense.categoryImage}` }} style={styles.SoftHardicons} />
            </View>

            <View style={styles.cardContent}>
              <View style={styles.cardContentColumn}>
                <Text style={styles.cardContentText}>
                Amount : {formatCurrency({ amount: Number(expense.amount), code: expense.mainCurrency })[0]} {' ( '}
                {expense.otherCurrencies.includes(',') ? (
                  <>
                    {expense.otherCurrencies.split(',').map((currency: any, index: any) => {
                      const convertedAmount = convertToOtherCurrencies(Number(expense.amount), currency);
                      return (
                        <React.Fragment key={index}>
                          {convertedAmount && `${convertedAmount} (${currency})`}
                          {index !== expense.otherCurrencies.split(',').length - 1 && ' | '}
                        </React.Fragment>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {expense.otherCurrencies && convertToOtherCurrencies(Number(expense.amount), expense.otherCurrencies)} ({expense.otherCurrencies}) 
                  </>
                )} {' ) '}
               </Text>

                <Text style={styles.cardContentText}>DateTime : {expense.dateExpense}</Text>
                <Text style={styles.cardContentText}>Currency : {expense.mainCurrency}</Text>
              </View>

              {showButtons && (
                <View style={styles.cardContentRow}>
                  <TouchableOpacity onPress={() => handleEditExpense(index)}>
                    <Image source={require('../assets/edit.png')} style={styles.icons} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteExpense(expense.idExp, index)} style={{ marginLeft: '2%' }}>
                    <Image source={require('../assets/delete.png')} style={styles.iconDelete} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* PDF Display */}
            <Modal visible={pdfModalVisible} transparent animationType="slide">

              <View style={styles.modalContainer}>
                {pdfImages.map((imgPath, imgIndex) => (
                  <View key={imgIndex} style={styles.imgContainer}>
                    <Image style={styles.image} source={{ uri: `file://${imgPath}` }} />
                  </View>
                ))}
                <TouchableOpacity style={styles.closeButton} onPress={() => setPdfModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </Modal>

            <Modal visible={editModalVisible} transparent animationType="slide">
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={{ color: 'black', fontWeight: 'bold', marginBottom: '20%', fontSize: 20, textAlign: 'center' }}>Edit expense</Text>
                  <TextInput
                    placeholder="Amount"
                    value={editedAmount}
                    onChangeText={(text: any) => setEditedAmount(text)}
                    keyboardType="numeric"
                    style={{
                      color: 'white',
                      paddingLeft: 15,
                      height: 44,
                      backgroundColor: '#2196F5',
                      borderRadius: 2,
                      marginBottom: '5%',
                      elevation: 5,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 3,
                    }}
                  />

                  <View style={{ marginBottom: 20, borderRadius: 5 }}>
                    <Button title={formatDate(selectedDate)} onPress={showDatePickerVisible} />
                    {isDatePickerVisible && (
                      <DateTimePicker value={selectedDate} mode="date" display="default" onChange={handleDateChange} />
                    )}
                  </View>

                  <View style={{ marginBottom: 20 }}>
                    <Button title={formatTime(selectedTime)} onPress={() => showTimePickerHandler()} />
                    {showTimePicker && (
                      <DateTimePicker
                        value={selectedTime}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={handleTimeChange}
                      />
                    )}
                  </View>

                  <SelectList
                    data={CategoryData}
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
                    inputStyles={{ color: 'white', fontWeight: 'bold', fontSize: 13, }}
                    dropdownTextStyles={{ color: 'black', fontWeight: 'bold' }}
                    badgeTextStyles={{ color: 'white', fontSize: 14 }}
                    badgeStyles={{ backgroundColor: '#2196F5' }}
                    labelStyles={{ color: 'black', fontWeight: 'bold' }}
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

                  <TouchableOpacity style={styles.button} onPress={EditPDF}>
                    <Text style={styles.buttonText} >Pick PDF</Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', width: '100%', height: '20%', alignItems: 'center', justifyContent: 'space-around' }}>
                    <TouchableOpacity onPress={handleSaveEditExpense} style={styles.SaveCancel}>
                      <Text style={styles.SaveCancelText} >Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCancelEdit} style={styles.SaveCancel}>
                      <Text style={styles.SaveCancelText} >Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

            </Modal>
          </View>

        ))
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data found</Text>
        </View>
      )}
    </View>
  );

};

const styles = StyleSheet.create({
  noDataContainer: {
    marginTop:'20%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'gray',
  },
  cardContainer: {
    backgroundColor:'white',
    width: '90%',
    height: 255,
    marginLeft: '5%',
    marginTop: '2%',
    marginBottom: '1%',
    paddingBottom:'2.5%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2, 
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  
  cardHeader: {
    backgroundColor: '#D9D9D9',
    width: '100%',
    height: '25%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingRight: '2.5%',
    paddingLeft: '2.5%',
    paddingTop: '3%',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  cardHeaderText: {
    color: 'black',
    fontSize: 17,
    fontWeight: 'bold',
    
  },
  headerText:{
    height: '98%',
    width: '48%',
  },
  icons: {
    width: 33,
    height: 33,
    marginLeft:'12%',
  },
  SoftHardicons: {
    width: 45,
    height: 45,
    borderRadius:40,
  },
  viewIcon: {
    width: 33,
    height: 33,
    marginRight:'30%',
  },
  cardContent: {
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  cardContentColumn: {
    marginRight: '2%',
    marginTop: '4%',
  },
  cardContentRow:{
    flexDirection: 'row',
    width:'100%',
    alignItems:'center',
    alignContent:'center',
    justifyContent: 'center',
  },
  cardContentText: {
    color: 'black',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: '5%',
    marginLeft: '3%',
  },
  iconDelete: {
    width: 35,
    height: 33,
  },
  modalContainer: {
    flex: 1,
    alignContent:'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  modalContent: {
    backgroundColor: 'white',
    width:'80%',
    padding: 20,
    borderRadius: 10,
  },
  button: {
    borderRadius:2,
    width: '100%',
    height: 44,
    marginTop: '5%',
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
    paddingTop:8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#FFFFFF', 
    paddingTop: 12,
    fontFamily: 'Verdana',
    textAlign: 'center',
    
  },
 
  imgContainer: {
    flex: 1,
    padding: 5,
  },
  image: {
    marginTop: 100,
    width: 350,
    height: 600,
  },
  closeButton: {
    backgroundColor: '#BD1839',
    padding: 10,
    borderRadius: 5,
    marginBottom:30,
    width:120,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize:18,
  },
});

export default ExpensesList
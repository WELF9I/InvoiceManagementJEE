import React, { useState, useRef, useEffect } from 'react';
import {Image,StyleSheet,Text,View,TouchableOpacity,
  SafeAreaView,
  ScrollView,
  DrawerLayoutAndroid,
  TextInput,
  Modal,
  ToastAndroid,
  RefreshControl,
} from 'react-native';
import Drawer from './Drawer';
import CategoriesList from './CategoriesList';
import ImagePicker from 'react-native-image-crop-picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import apiUrl from '../Api';
interface DataItem {
  idCat : any; 
  categoryName: string;
  categoryImage: string;
}

const Categories = () => {
  const [categoriesData, setCategoriesData] = useState<DataItem[]>([]);
  const drawer = useRef<DrawerLayoutAndroid>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [logoUri, setLogoUri] = useState<string>('');
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      displayCategoriesTable();
    }, 1000);
  }, []);

  useEffect(() => {
    displayCategoriesTable();
  }, []);


  const showToastWithGravity = (text: string) => {
    ToastAndroid.showWithGravity(
      text,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    );
  };

  const handleButtonImportSelect = () => {
    handleImageSelect();
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

  const handleSaveNewCategory = async () => {
    try {
      if (!newName || !logoUri) {
        showToastWithGravity('Name and icon are required.');
        return;
      }
      const base64Content = logoUri ? logoUri.toString() : '';
    const commaIndex = base64Content.indexOf(',');
    const logoToInsert = commaIndex !== -1 ? base64Content.substring(commaIndex + 1) : base64Content;
      const newCategory = {
        categoryName: newName,
        categoryImage: logoToInsert
      };

      const response = await fetch(`http://${apiUrl}:9090/categories/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCategory)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Category added successfully:', result);
        displayCategoriesTable();

        setNewName('');
        setLogoUri('');
        setAddModalVisible(false);
        showToastWithGravity('Category Added Successfully!');
      } else {
        showToastWithGravity('Failed to add Category');
      }
    } catch (error) {
      console.error('Error inserting Category: ', error);
      showToastWithGravity('Failed to add Category');
    }
  };

  const displayCategoriesTable = async () => {
    try {
      const response = await fetch(`http://${apiUrl}:9090/categories/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const newCategoriesData: DataItem[] = result.map((category: any) => ({
          idCat: category.idCat,
          categoryName: category.categoryName,
          categoryImage: category.categoryImage,
        }));

        setCategoriesData(newCategoriesData);
      } else {
        console.error('Error fetching categories:', response.statusText);
      }
    } catch (error) {
      console.error('Error displaying categories table: ', error);
    }
  };

  const handleImageSelect = async () => {
    try {
      const image = await ImagePicker.openPicker({
        cropping: true,
        width: 300,
        height: 300,
        includeBase64: true,
      });

      if ('data' in image && image.data) {
        setLogoUri(`data:${image.mime};base64,${image.data}`);
        showToastWithGravity('Icon picked successfully!');
      } else {
        console.log('Selected file is not an image:', image);
      }
    } catch (error) {
      console.log('Error selecting image:', error);
    }
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
            <Image source={require('../assets/categories.png')} style={styles.categoryIcon} />
            <Text style={{ fontWeight: 'bold', fontSize: 25, color: 'black', marginRight: '50%' }}>Categories</Text>
          </SafeAreaView>
        </View>
        <View style={styles.container}>
          <View style={{ width: '100%', height: '75%' }}>
            <ScrollView horizontal={false} showsVerticalScrollIndicator={true} refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
              <CategoriesList categoriesData={categoriesData}/>
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
              <Text style={{ color: 'black', fontWeight: 'bold', marginBottom: '20%', fontSize: 20, textAlign: 'center' }}>Add category</Text>
              <TextInput
                placeholder="Name"
                value={newName}
                onChangeText={(text: any) => setNewName(text)}
                keyboardType="default"
                style={{
                  color:'white',
                  paddingLeft: 15,
                  backgroundColor: '#2196F5',
                  borderRadius: 2,
                  marginBottom: '10%',
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                }}
              />
               <TouchableOpacity onPress={handleButtonImportSelect} style={styles.importButton}>
                  <Text style={styles.importButtonText}>Pick Icon</Text>
                </TouchableOpacity>
              
              <View style={{ flexDirection: 'row', width: '100%', height: '20%', alignItems: 'center', justifyContent: 'space-around',marginTop:'5%',}}>

                <TouchableOpacity onPress={handleSaveNewCategory} style={styles.SaveCancel}>
                  <Text style={styles.SaveCancelText} onPress={handleSaveNewCategory}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.SaveCancel}>
                  <Text style={styles.SaveCancelText} onPress={() => setAddModalVisible(false)}>Cancel</Text>
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
  importButton:{
    textAlign:'center',
    width: '100%',
    height:44,
    backgroundColor:'#2196F5',
    borderRadius:2,
    alignItems:'center',
    justifyContent:'center',
  },
  importButtonText:{
    fontSize:16,
    color:'white',
    fontWeight:'bold',
    textAlign:'center',
  },
    container: {
      flexDirection: 'column',
      marginTop: '9%',
      width: '100%',
      height: '90%',
      alignContent: 'center',
    },
    SaveCancel: {
      marginTop:'8%',
      width: '40%',
      height: 44,
      backgroundColor: '#2196F5',
      borderRadius: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 10,
      elevation: 5,
    },
    SaveCancelText: {
      fontWeight: 'bold',
      fontSize: 18,
      color: '#FFFFFF',
      textAlign: 'center',
      paddingTop: 7,
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
    categoryIcon: {
      width: 25,
      height: 25,
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
export default Categories
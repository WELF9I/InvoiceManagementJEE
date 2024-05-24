import React, {useEffect, useState} from 'react';
import {Image,StyleSheet,Text,View,TouchableOpacity,SafeAreaView,TextInput,Switch,ScrollView,ToastAndroid} from 'react-native';
import {MultipleSelectList,SelectList,} from 'react-native-dropdown-select-list';
import ImagePicker from 'react-native-image-crop-picker';
import {useNavigation} from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface Currency {
  [x: string]: any;
  key: string;
  value: string;
}

const Settings = () => {
  const curr: Currency[] = [
    {key: '1', value: 'TND'},
    {key: '2', value: 'EUR'},
    {key: '3', value: 'USD'},
    {key: '4', value: 'GBP'},
  ];
  const defaultLogo =require('../assets/addLogo.png');

  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [originalSelectedCurrencies, setOriginalSelectedCurrencies] = useState<string[]>([]);
  const [logoUri, setLogoUri] = useState<any>();
  const [logoImage, setLogoImage] = useState<any>();
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [otherCurrencies, setOtherCurrencies] = useState<Currency[]>([]);
import apiUrl from '../'
  const showToastWithGravity = (text:string) => {
    ToastAndroid.showWithGravity(
      text,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
      
    );
  };
  const fetchDataAndSetSelectedCurrencies = async () => {
    try {
      const response = await fetch(`http://192.168.100.141:9090/user/1`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data) {
          setName(data.name);
          setLogoImage(data.logo ? { uri :`data:image/png;base64,${data.logo}` } : defaultLogo);
          setLogoUri(data.logo ? { uri :data.logo } : defaultLogo);
          setSelectedCurrency(data.mainCurrency);
          setOriginalSelectedCurrencies(data.otherCurrencies.split(','));
          setIsChecked(data.deviceLock === true);
        }
      } else {
        console.error('Failed to fetch data from the server:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching data from the server:', error);
    }
  };
  
  useEffect(() => {
    fetchDataAndSetSelectedCurrencies();
  }, []);  

  useEffect(() => {
    const updatedOtherCurrencies = curr.filter(currency => currency.value !== selectedCurrency);
    setOtherCurrencies(updatedOtherCurrencies);
  }, [selectedCurrency]);

  const handleSaveSettings = async () => {
    if (!name || selectedCurrencies.length === 0) {
      showToastWithGravity('Please fill in all required fields');
      return;
    }
  
    try {
      const getResponse = await fetch('http://192.168.100.141:9090/user/1');
      if (!getResponse.ok) {
        throw new Error(`Failed to fetch existing data: ${getResponse.statusText}`);
      }
  
      const existingData = await getResponse.json();
      const existingLogo = existingData.logo;

      const putResponse = await fetch('http://192.168.100.141:9090/user/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          logo: logoUri && logoUri !== existingLogo ? logoUri.uri : existingLogo,
          mainCurrency: selectedCurrency,
          otherCurrencies: selectedCurrencies.join(','),
          deviceLock: isChecked ? true : false,
        }),
      });
  
      if (putResponse.ok) {
        console.log('Data saved to the server');
        showToastWithGravity('Settings updated successfully!');
      } else {
        console.error('Error saving data to the server:', putResponse.statusText);
        showToastWithGravity('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      showToastWithGravity('Failed to update settings');
    }
  };
  
  
  
  
  
  const handlePress = () => {
    navigation.goBack();
  };
  const toggleIsChecked = () => {
    setIsChecked(value => !value);
  };

  const handleNameChange = (text: string) => {
    setName(text);
  };
  
  const handleUploadImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        cropping: true,
        width: 300,
        height: 300,
        includeBase64: true,
      });
  
      if ('data' in image) {
        if (image.data) {
          setLogoUri({ uri: image.data });
          setLogoImage(image.data ? { uri :`data:${image.mime};base64,${image.data}` } : defaultLogo);
        } else {
          console.log('Image data is missing.');
        }
      } else {
        console.log('Selected file is a video:', image);
      }
    } catch (error) {
      console.log('Error selecting image:', error);
    }
  };
  return (
    <ScrollView>
      <SafeAreaView style={styles.background}>
        <View
          style={{
            backgroundColor: '#4169E1',
            justifyContent: 'center',
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
            height: '8%',
            alignItems: 'center',
          }}>
          <SafeAreaView
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              height: '60%',
              width: '95%',
              marginBottom: '2%',
            }}>
            <TouchableOpacity onPress={handlePress}>
              <Image
                source={require('../assets/leftArrow.png')}
                style={styles.settingImage}
              />
            </TouchableOpacity>

            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 25,
                color: 'black',
                marginRight: '50%',
                paddingBottom: '1.4%',
              }}>
              Settings
            </Text>
            <Image
              source={require('../assets/setting.png')}
              style={styles.settingImage}
            />
          </SafeAreaView>
        </View>

        <SafeAreaView style={styles.container}>
          <View style={{marginRight: '63%'}}>
            <Text style={{fontWeight: 'bold', fontSize: 23, color: 'black'}}>
              Edit profile
            </Text>
          </View>

          <View>
            {logoUri && logoUri.uri && logoUri.uri !== '' ? (
              <Image source={logoImage} style={styles.image} />
            ) : (
              <Image
                source={defaultLogo}
                style={styles.image}
              />
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUploadImage}>
              <Text style={styles.uploadButtonText}>Upload image</Text>
            </TouchableOpacity>
          </View>


          <View style={{width: '95%'}}>
            <Text
              style={{
                marginTop: '10%',
                fontSize: 20,
                fontWeight: 'bold',
                color: 'black',
              }}>
              Name
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Lorem Ipsum"
              value={name}
              onChangeText={handleNameChange}
              accessible={true}
              accessibilityLabel="Name input"
            />
          </View>

          <View style={{width: '95%', marginBottom: '10%'}}>
            <SelectList
              data={curr}
              save="value"
              placeholder="Main currency"
              setSelected={(val: any) => setSelectedCurrency(val)}
              defaultOption={{key:curr.find(currency => currency.value === selectedCurrency)?.value || '',value:selectedCurrency}}
              boxStyles={{
                borderRadius: 5,
                borderColor: '#4169E1',
                borderStyle: 'solid',
                backgroundColor: '#4169E1',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                height: 50,
              }}
              inputStyles={{color: 'black', fontWeight: 'bold', fontSize: 17}}
              dropdownTextStyles={{color: 'black', fontWeight: 'bold'}}
              dropdownItemStyles={{
                backgroundColor: '#4169E1',
                marginHorizontal: 6,
              }}
              dropdownStyles={{
                backgroundColor: '#4169E1',
                borderRadius: 8,
                borderColor: 'white',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
            />
          </View>

          <View style={{width: '95%'}}>
          <MultipleSelectList
            setSelected={(val: any) => setSelectedCurrencies(val)}
            data={otherCurrencies}
            placeholder="Other currencies"
            save="value"
            onSelect={() => {}}
            label="Currencies"
            
            boxStyles={{
              borderRadius: 5,
              borderColor: '#4169E1',
              borderStyle: 'solid',
              backgroundColor: '#4169E1',
            }}
            inputStyles={{color: 'black', fontWeight: 'bold', fontSize: 17}}
            dropdownTextStyles={{color: 'black', fontWeight: 'bold'}}
            checkBoxStyles={{
              backgroundColor: '#FFFFFF',
              borderColor: 'black',
            }}
            badgeStyles={{backgroundColor: '#FFFFFF'}}
            badgeTextStyles={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: 14,
            }}
            labelStyles={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: 16,
              marginLeft: 2,
            }}
            dropdownItemStyles={{
              backgroundColor: '#4169E1',
              marginHorizontal: 5,
              borderRadius: 5,
            }}
            dropdownStyles={{
              backgroundColor: '#4169E1',
              borderRadius: 8,
              borderColor: '#4169E1',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 5,
            }}
          />
          </View>

          <View style={styles.switch}>
            <Switch
              value={isChecked}
              onValueChange={toggleIsChecked}
              thumbColor={isChecked ? 'white' : 'white'}
              trackColor={{false: 'red', true: 'green'}}
              style={{}}
            />
            <Text style={styles.textSwitch}>Enable device lock</Text>
          </View>

          <View
            style={{
              width: '95%',
              alignItems: 'center',
              flexDirection: 'row',
              marginTop: '7%',
              justifyContent: 'center',
            }}>
            <TouchableOpacity onPress={handleSaveSettings} style={styles.button}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
    padding: 20,
    width: '90%',
    height: '90%',
    marginLeft: '5%',
    marginTop: '5%',
    alignContent: 'center',
  },
  settingImage: {
    width: 25,
    height: 25,
  },
  background: {
    height: hp('100%'),
    backgroundColor: 'white',
  },
  image: {
    width: 120,
    height: 120,
    margin: '5%',
    borderRadius: 80,
  },
  button: {
    width: '50%',
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
  uploadButton: {
    width: 150,
    height: 40,
    backgroundColor: '#4169E1',
    borderRadius: 5,
    marginTop: '1%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadButtonText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 17,
    color: '#000',
    paddingTop: 8,
    fontFamily: 'Verdana',
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
    color: '#FFFFFF',
    paddingTop: 12,
    fontFamily: 'Verdana',
  },
  input: {
    borderStyle: 'solid',
    borderBottomColor: 'black',
    borderBottomWidth: 2,
    fontSize: 17,
    fontWeight: 'bold',
    height: 50,
    backgroundColor: '#FFFFFF',
    marginTop: '0%',
    padding: 10,
    width: '100%',
    marginBottom: '10%',
  },
  switch: {
    marginRight: '35%',
    marginTop: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    width: '62%',
  },
  textSwitch: {
    color: 'black',
    fontSize: 17,
    paddingBottom: '1.5%',
    paddingLeft: '3%',
    fontWeight: 'bold',
  },
});

export default Settings;
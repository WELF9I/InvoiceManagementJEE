import React, {useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Switch,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import {
  MultipleSelectList,
  SelectList,
} from 'react-native-dropdown-select-list';
import ImagePicker from 'react-native-image-crop-picker';
import {useNavigation} from '@react-navigation/native';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import apiUrl from '../Api';
interface Currency {
  key: string;
  value: string;
  selected?: boolean;
}

const WelcomePage = () => {
  const curr: Currency[] = [
    {key: '1', value: 'TND'},
    {key: '2', value: 'EUR'},
    {key: '3', value: 'USD'},
    {key: '4', value: 'GBP'},
  ];
  const showToastWithGravity = (text: string) => {
    ToastAndroid.showWithGravity(text, ToastAndroid.SHORT, ToastAndroid.CENTER);
  };
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [logoUri, setLogoUri] = useState<any>();
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [otherCurrencies, setOtherCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    const updatedOtherCurrencies = curr.filter(
      currency => currency.value !== selectedCurrency,
    );
    setOtherCurrencies(updatedOtherCurrencies);
  }, [selectedCurrency]);

  const handleNameChange = (text: string) => {
    setName(text);
  };

  const handleProceed = async () => {
    if (!name || !selectedCurrency || selectedCurrencies.length === 0) {
      showToastWithGravity('Please fill in all required fields');
      return;
    }
    //console.log('selectedCurrencies : ', selectedCurrencies);
    const base64Content = logoUri ? logoUri.toString() : '';
    const otherCurrencies = selectedCurrencies.join(',') || null;
    const commaIndex = base64Content.indexOf(',');
    const logoToInsert = commaIndex !== -1 ? base64Content.substring(commaIndex + 1) : base64Content;
    // Now logoToInsert contains only the string after 'image/jpeg;base64,'
    const base64Prefix = 'data:image/jpeg;base64,';
    // Concatenate the prefix with the logo content
    const completeLogo = base64Prefix + logoToInsert;
    console.log("Welcome data :  logo uri : ",logoToInsert);
    const data = {
      name: name,
      logo: logoToInsert,
      mainCurrency: selectedCurrency,
      otherCurrencies: otherCurrencies,
      deviceLock: isChecked ? true : false,
    };
    //console.log("Welcome data:", JSON.stringify(data));
    try {
      const response = await fetch(`http://${apiUrl}:9090/user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        showToastWithGravity('Welcome data added successfully');
        navigation.navigate('Expenses');
      } else {
        const errorMessage = await response.text();
        console.log("errorMessage : ", errorMessage);
        showToastWithGravity(`Failed to add Welcome data: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error posting Welcome data:', error);
      showToastWithGravity('Failed to add Welcome data');
    }
  };

  const toggleIsChecked = () => {
    setIsChecked((value) => !value);
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
          setLogoUri(`data:${image.mime};base64,${image.data}`);
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
        <SafeAreaView style={styles.container}>
          <View><Text style={{ fontWeight: 'bold', fontSize: 40, color: '#FFFFFF', textAlign: 'center', marginTop: '4%' }}>Welcome</Text></View>

          <View>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.image} />
            ) : (
              <Image source={require('../assets/addLogo.png')} style={styles.image} />
            )}
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadImage}>
              <Text style={styles.uploadButtonText}>Upload image</Text>
            </TouchableOpacity>
          </View>

          <View style={{ width: '95%' }}>
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={handleNameChange} accessible={true} accessibilityLabel="Name input"/>
          </View>

          <View style={{ width: '95%', marginBottom: '10%' }}>
            <SelectList
              data={curr}
              save="value"
              placeholder='Main currency'
              setSelected={(val: any) => setSelectedCurrency(val)}
              boxStyles={{
                borderRadius: 5,
                borderColor: '#FFFFFF',
                borderStyle: 'solid',
                backgroundColor: '#FFFFFF',
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
              inputStyles={{ color: 'black', fontWeight: 'bold', fontSize: 17 }}
              dropdownTextStyles={{ color: 'black', fontWeight: 'bold' }}

              badgeTextStyles={{ color: 'black', fontWeight: 'bold', fontSize: 14 }}
              badgeStyles={{ backgroundColor: '#FFFFFF' }}
              labelStyles={{ color: 'black', fontWeight: 'bold', fontSize: 15, marginLeft: 2, borderRadius: 5 }}
              dropdownItemStyles={{
                backgroundColor: '#FFFFFF',
                marginHorizontal: 6
              }}
              dropdownStyles={{
                backgroundColor: 'white',
                borderRadius: 8,
                borderColor: 'white',
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
          </View>

          <View style={{ width: '95%' }}>
            <MultipleSelectList
              setSelected={(val: any) => {
                setSelectedCurrencies(val);
              }}
              data={otherCurrencies}
              placeholder='Other currencies'
              save="value"
              onSelect={() => { }}
              label="Currencies"
              boxStyles={{
                borderRadius: 5,
                borderColor: '#FFFFFF',
                borderStyle: 'solid',
                backgroundColor: '#FFFFFF',
                shadowColor: '#000',
              }}
              inputStyles={{ color: 'black', fontWeight: 'bold', fontSize: 17 }}
              dropdownTextStyles={{ color: 'black', fontWeight: 'bold' }}
              checkBoxStyles={{ backgroundColor: '#FFFFFF', borderColor: 'black' }}
              badgeTextStyles={{ color: 'black', fontWeight: 'bold', fontSize: 15 }}
              badgeStyles={{ backgroundColor: '#FFFFFF' }}
              labelStyles={{ color: 'black', fontWeight: 'bold', fontSize: 16, marginLeft: 2 }}
              dropdownItemStyles={{
                backgroundColor: '#FFFFFF',
                marginHorizontal: 5,
                borderRadius: 5

              }}
              dropdownStyles={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                borderColor: '#FFFFFF',
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
          </View>

          <View style={styles.switch}>
            <Switch
              value={isChecked}
              onValueChange={toggleIsChecked}
              thumbColor={isChecked ? '#FFFFFF' : '#FFFFFF'}
              trackColor={{ false: 'red', true: 'green' }}
            />
            <Text style={styles.textSwitch}>Enable device lock</Text>
          </View>

          <View style={{ width: '95%', alignItems: 'center', flexDirection: 'row', marginTop: '7%', justifyContent: 'center', }}>
            <TouchableOpacity onPress={handleProceed} style={styles.button} >
              <Text style={styles.buttonText}>Proceed</Text>
            </TouchableOpacity>
            <Image source={require('../assets/rightArrow.png')} style={styles.arrowImage} />
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
  background: {
    height: hp('100%'),
    backgroundColor: '#4169E1',
  },
  image: {
    width: 130,
    height: 130,
    margin: '5%',
    borderRadius: 80,
  },
  button: {
    width: '50%',
    height: 55,
    marginTop: '1%',
    marginBottom: '1%',
    marginLeft: '25%',
    marginRight: '5%',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
    color: '#000',
    paddingTop: 12,
    fontFamily: 'Verdana',
  },
  input: {
    fontSize: 17,
    fontWeight: 'bold',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginTop: '15%',
    padding: 10,
    width: '100%',
    marginBottom: '10%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  switch: {
    marginRight: '35%',
    marginTop: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    width: '62%',
  },
  textSwitch: {
    color: 'white',
    fontSize: 17,
    paddingBottom: '1.5%',
    paddingLeft: '3%',
    fontWeight: 'bold',
  },
  arrowImage: {
    width: 25,
    height: 25,
    marginLeft: '10%',
  },
});

export default WelcomePage;
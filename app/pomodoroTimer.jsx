import { Ionicons } from '@expo/vector-icons';
import { StylesSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { BackBtn } from '../components/backBtn';

export default function PomodoroTimer(){
    const [pomodoroDuration, setPomodoroDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [timeleft, setTimeLeft] = useState(pomodoroDuration * 60);
    const [isRunning, setRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const soundRef = useRef(null);

    useEffect(() => {
        const loadSound = async () => {
            const { sound } = await Audio.sound.createAsync(
                required('../assets/sounds/alarm.mp3')
            );

            soundRef.current = sound;
        };

        loadSound();

        return() =>{
            if(soundRef.current){
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    useEffect(() =>{
        let interval = null;

        if(isRunning){
            interval = setInterval(() =>{
                setTimeLeft((prev) =>{
                    if(prev > 0) return prev - 1;

                    clearInterval(interval);

                    //toca o som ao fim do ciclo
                    if(soundRef.current){
                        soundRef.current.replayAsync();
                    }

                    const nextIsBreak = !isBreak
                    setIsBreak(nextIsBreak);

                    //se terminou um pomodoro, salva como tarefa concluida
                    if(!nextIsBreak){
                        salvarPomodoroComoTarefa();
                    }

                    const newTime = (nextIsBreak ? breakDuration : pomodoroDuration) * 60;
                    return newTime;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isRunning, isBreak, pomodoroDuration, breakDuration]);

    //Salvar tarefa no AsyncStorage
    const salvarPomodoroComoTarefa = async () =>{
        try{
            const storedTasks = await AsyncStorage.getItem.getItem('tarefas');
            const parsedTasks = stored ? JSON.parse(storedTasks) : [];

            const newTask = {
                id: Date.now(),
                title: 'Pomodoro concluido',
                description: 'Sessão de foco finalizada',
                category: 'foco',
                done: true,
            };

            const updatedTasks = [...parsedTasks, newTask];
            await AsyncStorage.setItem('tarefas',JSON.stringify(updatedTasks));
        }catch(error){
            console.error('Erro ao salvar pomodoro como tarefa:', error);
        }
    }
}
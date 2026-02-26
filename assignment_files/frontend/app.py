import streamlit as st
import requests
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

st.set_page_config(page_title="Titanic Insight Agent", layout="wide")

# Custom CSS for a more "pleasing" look
st.markdown("""
    <style>
    .main {
        background-color: #f8f9fa;
    }
    .stButton>button {
        width: 100%;
        border-radius: 5px;
        height: 3em;
        background-color: #FF4B4B;
        color: white;
    }
    .stTextInput>div>div>input {
        border-radius: 5px;
    }
    </style>
    """, unsafe_allow_html=True)

st.title("🚢 Titanic Dataset Chat Agent")
st.markdown("### Interactive Data Analysis with LangChain & FastAPI")

# Sidebar for stats
st.sidebar.header("📊 Dataset Overview")
try:
    stats_res = requests.get("http://localhost:8000/stats").json()
    st.sidebar.metric("Total Passengers", stats_res["total_passengers"])
    st.sidebar.metric("Survival Rate", f"{stats_res['survival_rate']:.2%}")
    st.sidebar.metric("Avg Age", f"{stats_res['average_age']:.1f}")
except:
    st.sidebar.warning("⚠️ Backend not connected. Run FastAPI first.")

# Chat Interface
if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("Ask about the Titanic passengers..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        with st.spinner("Agent is thinking..."):
            try:
                response = requests.post(
                    "http://localhost:8000/analyze", 
                    json={"query": prompt}
                ).json()
                
                answer = response["answer"]
                st.markdown(answer)
                st.session_state.messages.append({"role": "assistant", "content": answer})
                
                # Visualizations
                if any(word in prompt.lower() for word in ["histogram", "age", "distribution"]):
                    df = pd.read_csv("https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv")
                    fig, ax = plt.subplots()
                    sns.histplot(df['Age'].dropna(), kde=True, color='#FF4B4B', ax=ax)
                    st.pyplot(fig)
                elif any(word in prompt.lower() for word in ["port", "embarked", "count"]):
                    df = pd.read_csv("https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv")
                    fig, ax = plt.subplots()
                    df['Embarked'].value_counts().plot(kind='bar', color='#1C83E1', ax=ax)
                    st.pyplot(fig)
                    
            except Exception as e:
                st.error(f"Error: {e}")

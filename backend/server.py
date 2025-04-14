import asyncio
from symptom import get_medical_ner_predictions
from speciality import zero_shot_classification_batch
import websockets
import json
import google.generativeai as genai
import constants

# Configure your Google Generative AI API key
genai.configure(api_key=constants.GOOGLE_GENERATIVE_AI_API_KEY)  # Replace with your actual API key
model = genai.GenerativeModel('gemini-1.5-flash')  # Or 'gemini-pro-vision' if you need image input

system_prompt = constants.SYSTEM_PROMPT

async def handle_client(websocket):
    print(f"Client connected: {websocket.remote_address}")
    try:
        async for message in websocket:
            print(f"Received message: {message}")
            try:
                data = json.loads(message)
                # Expecting the client to send {"inputMessage": "..."}
                user_message = data.get("inputMessage", "")
                if not user_message:
                    response = {"error": "No inputMessage provided"}
                else:
                    # #### Syptom Extraction ####
                    # predictions = get_medical_ner_predictions(user_message)
                    # print("\n🩺 Medical NER Predictions:")
                    # for word, label, score in predictions:
                    #     print(f"🔹 Entity: {word} | Category: {label} | Score: {score:.4f}")
                    # # print("\n🩺 Medical NER Predictions(RAW): ", predictions)
                    
                    # #### Medical Speciality Classification ####
                    # classification1 = zero_shot_classification_batch([user_message])
                    # print("\n🩺 Medical Speciality Classification:", classification1)
                    
                    ai_result = model.generate_content(system_prompt+user_message, stream=True)
                    
                    # Send response chunks back to the client
                    for chunk in ai_result:
                        if hasattr(chunk, 'text') and chunk.text:
                            await websocket.send(json.dumps({
                                "type": "chunk",
                                "content": chunk.text
                            }))
                            
                            await asyncio.sleep(0.01)
                    
                    # Signal end of response
                    await websocket.send(json.dumps({
                        "type": "end",
                        "content": "[DONE]"
                    }))
            
            except Exception as e:
                await websocket.send(json.dumps({"type":"error", "message":str(e)}))
                            
    except websockets.exceptions.ConnectionClosedError:
        print("Client disconnected unexpectedly")
    finally:
        print(f"Client disconnected: {websocket.remote_address}")

async def main():
    async with websockets.serve(handle_client, "localhost", 9080):
        print("WebSocket server running on ws://localhost:9080")
        await asyncio.Future()
        
if __name__ == "__main__":
    asyncio.run(main())

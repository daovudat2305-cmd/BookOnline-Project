package bookonline.dto.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data 
@AllArgsConstructor
public class GroqRequest {
    private String model;
    private List<Message> messages;
    private double temperature;
    
    @Data 
    @AllArgsConstructor
    public static class Message {
        private String role;
        private String content;
    }
}

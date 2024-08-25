package pl.lodz.p.it.accountmicroservice.model;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Role {
    private String username;
    private List<String> roles;
}
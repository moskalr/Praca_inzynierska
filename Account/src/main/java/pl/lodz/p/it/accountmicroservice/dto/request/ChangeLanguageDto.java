package pl.lodz.p.it.accountmicroservice.dto.request;

import pl.lodz.p.it.accountmicroservice.model.Language;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangeLanguageDto {
    @NotNull
    private Language language;
}

# Contrato da API para o frontend

Este documento descreve os corpos JSON, os status HTTP, os erros e todas as validações atualmente aplicadas aos endpoints de clientes. Os exemplos usam `en-US`; o formato do JSON e os códigos são os mesmos em `pt-BR`, mas os campos `message` são traduzidos.

## Idioma das mensagens

Envie `Accept-Language` em todas as requisições para receber mensagens no idioma selecionado:

| Idioma | Header |
| --- | --- |
| Português (Brasil) | `Accept-Language: pt-BR` |
| English (US) | `Accept-Language: en-US` |

Sem header, ou com idioma não suportado, a API usa `pt-BR`. A API traduz `message` e `errors[].message`, mas não traduz nomes de campos, códigos, enums nem valores de dados. Use `code` para lógica da aplicação, `errors[].field` para associar erros aos campos do formulário e `message` para exibir texto ao usuário. Não dependa da ordem dos itens em `errors`.

## Endpoints e status de sucesso

Todos os endpoints usam o prefixo `/api/v1/customers`.

| Método | Caminho | Sucesso |
| --- | --- | --- |
| `POST` | `/api/v1/customers` | `201 Created` |
| `GET` | `/api/v1/customers` | `200 OK` |
| `GET` | `/api/v1/customers/{id}` | `200 OK` |
| `PUT` | `/api/v1/customers/{id}` | `200 OK` |
| `DELETE` | `/api/v1/customers/{id}` | `200 OK` |

### Criar, consultar e atualizar

`POST` e `PUT` recebem os mesmos campos. `PUT` substitui os dados do cliente; o `id` é enviado apenas na URL. `address`, `gender` e `additionalPhone` são opcionais. Datas devem usar `YYYY-MM-DD`.

Resposta de criação (`201`), consulta por ID (`200`) e atualização (`200`):

```json
{
  "success": true,
  "message": "Customer successfully registered.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "Maria da Silva",
    "cpf": "52998224725",
    "email": "maria@example.com",
    "phoneNumber": "11999999999",
    "additionalPhone": "1133334444",
    "birthDate": "1990-05-20",
    "gender": "FEMALE",
    "address": {
      "zipCode": "01310100",
      "street": "Avenida Paulista",
      "number": "1000",
      "complement": "Apt 12",
      "neighborhood": "Bela Vista",
      "city": "São Paulo",
      "state": "SP"
    },
    "createdAt": "2026-01-01T12:00:00",
    "updatedAt": "2026-01-02T12:00:00"
  }
}
```

O texto de `message` depende da operação. Campos nulos do cliente, como `address`, `additionalPhone`, `gender` e `updatedAt`, são omitidos. Se `address` existir, seus campos são serializados; `complement` pode aparecer como `null`. O CPF, os telefones e o CEP são retornados normalizados, apenas com dígitos. O ID é uma string UUID gerada pelo backend.

| Operação | `message` `en-US` | `message` `pt-BR` |
| --- | --- | --- |
| Criar | `Customer successfully registered.` | `Cliente cadastrado com sucesso.` |
| Listar | `Customers successfully retrieved.` | `Clientes consultados com sucesso.` |
| Consultar | `Customer successfully retrieved.` | `Cliente consultado com sucesso.` |
| Atualizar | `Customer successfully updated.` | `Cliente atualizado com sucesso.` |
| Excluir | `Customer successfully deleted.` | `Cliente excluído com sucesso.` |

### Listar

`page` começa em zero (padrão `0`); `size` tem padrão `20` e aceita de `1` a `100`. A lista é ordenada por ID.

```json
{
  "success": true,
  "message": "Customers successfully retrieved.",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "fullName": "Maria da Silva",
        "cpf": "52998224725",
        "email": "maria@example.com",
        "phoneNumber": "11999999999",
        "birthDate": "1990-05-20",
        "createdAt": "2026-01-01T12:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

Os campos nulos do cliente são omitidos. Uma página sem resultados retorna `content: []`.

### Excluir

```json
{
  "success": true,
  "message": "Customer successfully deleted."
}
```

A resposta não inclui `data`. A exclusão remove fisicamente o cliente e o endereço associado.

## Formato comum de erro

Todas as respostas de erro tratadas pela API usam `success: false`, um `code` estável, uma mensagem localizada e o caminho requisitado. `errors` só aparece quando há detalhes por campo; não está presente em erros sem detalhes.

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed.",
  "path": "/api/v1/customers",
  "errors": [
    {
      "field": "fullName",
      "message": "Full name is required."
    }
  ]
}
```

## Catálogo de erros e status HTTP

| HTTP | `code` | Quando ocorre | Mensagem `en-US` | Mensagem `pt-BR` |
| --- | --- | --- | --- | --- |
| `400` | `VALIDATION_ERROR` | Campo do corpo ou parâmetro falha uma validação de domínio. | `Validation failed.` | `Falha na validação.` |
| `400` | `INVALID_REQUEST` | JSON malformado, data/enum/valor inválido ou parâmetro que não pode ser convertido. | `Invalid request.` | `Requisição inválida.` |
| `404` | `CUSTOMER_NOT_FOUND` | ID de cliente não encontrado em GET, PUT ou DELETE. | `Customer not found.` | `Cliente não encontrado.` |
| `404` | `RESOURCE_NOT_FOUND` | Caminho/endpoint não encontrado. | `The requested resource was not found.` | `O recurso solicitado não foi encontrado.` |
| `405` | `METHOD_NOT_ALLOWED` | Método HTTP não suportado para o endpoint. | `HTTP method not supported for this endpoint.` | `Método HTTP não suportado para este endpoint.` |
| `409` | `CUSTOMER_ALREADY_EXISTS` | CPF ou e-mail já cadastrado. | `Customer already exists.` | `O cliente já existe.` |
| `415` | `UNSUPPORTED_MEDIA_TYPE` | Tipo de conteúdo não suportado; envie JSON nos requests com corpo. | `Content type not supported. Use application/json.` | `Tipo de conteúdo não suportado. Use application/json.` |
| `500` | `INTERNAL_SERVER_ERROR` | Erro inesperado no servidor. Detalhes internos não são retornados. | `Internal server error. Please contact support if the problem persists.` | `Erro interno do servidor. Entre em contato com o suporte se o problema persistir.` |

Exemplo de cliente não encontrado (`404`):

```json
{
  "success": false,
  "code": "CUSTOMER_NOT_FOUND",
  "message": "Customer not found.",
  "path": "/api/v1/customers/550e8400-e29b-41d4-a716-446655440000"
}
```

Exemplo de conflito de CPF (`409`). Para e-mail duplicado, `field` será `email` e a mensagem de campo será a correspondente:

```json
{
  "success": false,
  "code": "CUSTOMER_ALREADY_EXISTS",
  "message": "Customer already exists.",
  "path": "/api/v1/customers",
  "errors": [
    {
      "field": "cpf",
      "message": "A customer with this CPF is already registered."
    }
  ]
}
```

Mensagens de duplicidade por campo:

| Campo | `en-US` | `pt-BR` |
| --- | --- | --- |
| `cpf` | `A customer with this CPF is already registered.` | `Já existe um cliente cadastrado com este CPF.` |
| `email` | `A customer with this email is already registered.` | `Já existe um cliente cadastrado com este e-mail.` |

Exemplo de request inválido por formato de data (`400`). Um enum inválido, como `gender: "UNKNOWN"`, também usa `INVALID_REQUEST`; a mensagem explica os valores aceitos. JSON malformado usa o mesmo `code` e pode apresentar `field: null`:

```json
{
  "success": false,
  "code": "INVALID_REQUEST",
  "message": "Invalid request.",
  "path": "/api/v1/customers",
  "errors": [
    {
      "field": "birthDate",
      "message": "The date must follow the YYYY-MM-DD format."
    }
  ]
}
```

Exemplo de JSON malformado:

```json
{
  "success": false,
  "code": "INVALID_REQUEST",
  "message": "Invalid request.",
  "path": "/api/v1/customers",
  "errors": [
    {
      "field": null,
      "message": "The request body is malformed."
    }
  ]
}
```

Exemplos das respostas dos demais erros sem detalhes de campo:

```json
{
  "success": false,
  "code": "RESOURCE_NOT_FOUND",
  "message": "The requested resource was not found.",
  "path": "/api/v1/unknown"
}
```

```json
{
  "success": false,
  "code": "METHOD_NOT_ALLOWED",
  "message": "HTTP method not supported for this endpoint.",
  "path": "/api/v1/customers"
}
```

```json
{
  "success": false,
  "code": "UNSUPPORTED_MEDIA_TYPE",
  "message": "Content type not supported. Use application/json.",
  "path": "/api/v1/customers"
}
```

```json
{
  "success": false,
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Internal server error. Please contact support if the problem persists.",
  "path": "/api/v1/customers"
}
```

Erros de parâmetro de paginação que não podem ser convertidos para inteiro também usam `INVALID_REQUEST`, com `errors[].field` igual a `page` ou `size` e mensagem `Invalid value for this parameter.` / `Valor inválido para este parâmetro.`. Valores inteiros fora dos limites usam `VALIDATION_ERROR`.

## Validações dos campos

Uma violação de validação do corpo ou dos limites da paginação retorna `400` com `code: "VALIDATION_ERROR"`. Cada entrada em `errors` contém o nome do campo no formato JSON (campos aninhados usam ponto) e a mensagem traduzida. Um request pode retornar vários erros ao mesmo tempo.

| Campo | Regra | Mensagem `en-US` | Mensagem `pt-BR` |
| --- | --- | --- | --- |
| `fullName` | Obrigatório; entre 3 e 150 caracteres. | `Full name is required.` / `Full name must have between 3 and 150 characters.` | `O nome completo é obrigatório.` / `O nome completo deve ter entre 3 e 150 caracteres.` |
| `cpf` | Obrigatório; CPF brasileiro válido, com 11 dígitos e dígitos verificadores válidos. Aceita pontuação padrão. | `CPF is required.` / `The provided CPF is invalid.` | `O CPF é obrigatório.` / `O CPF informado é inválido.` |
| `email` | Obrigatório; formato de e-mail válido; máximo de 150 caracteres. | `Email is required.` / `The provided email is invalid.` / `Email must have at most 150 characters.` | `O e-mail é obrigatório.` / `O e-mail informado é inválido.` / `O e-mail deve ter no máximo 150 caracteres.` |
| `phoneNumber` | Obrigatório; telefone brasileiro válido. | `Phone number is required.` / `The provided phone number is invalid.` | `O telefone é obrigatório.` / `O telefone informado é inválido.` |
| `additionalPhone` | Opcional; quando informado, deve ser telefone brasileiro válido. | `The provided phone number is invalid.` | `O telefone informado é inválido.` |
| `birthDate` | Obrigatório; data ISO `YYYY-MM-DD`, não futura. | `Birth date is required.` / `Birth date cannot be in the future.` | `A data de nascimento é obrigatória.` / `A data de nascimento não pode estar no futuro.` |
| `gender` | Opcional; `MALE`, `FEMALE`, `OTHER` ou `PREFER_NOT_TO_SAY`. | `Invalid value. Accepted values: [MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY].` | `Valor inválido. Valores aceitos: [MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY].` |
| `address` | Opcional; se enviado, os campos obrigatórios do endereço devem ser preenchidos. | — | — |
| `address.zipCode` | Obrigatório dentro do endereço; 8 dígitos, aceita `12345678` ou `12345-678`. | `ZIP code (CEP) is required.` / `The ZIP code (CEP) must contain 8 digits.` | `O CEP é obrigatório.` / `O CEP deve conter 8 dígitos.` |
| `address.street` | Obrigatório dentro do endereço; máximo de 150 caracteres. | `Street is required.` / `Street must have at most 150 characters.` | `A rua é obrigatória.` / `A rua deve ter no máximo 150 caracteres.` |
| `address.number` | Obrigatório dentro do endereço; máximo de 20 caracteres. | `Number is required.` / `Number must have at most 20 characters.` | `O número é obrigatório.` / `O número deve ter no máximo 20 caracteres.` |
| `address.complement` | Opcional; máximo de 100 caracteres. | `Complement must have at most 100 characters.` | `O complemento deve ter no máximo 100 caracteres.` |
| `address.neighborhood` | Obrigatório dentro do endereço; máximo de 100 caracteres. | `Neighborhood is required.` / `Neighborhood must have at most 100 characters.` | `O bairro é obrigatório.` / `O bairro deve ter no máximo 100 caracteres.` |
| `address.city` | Obrigatório dentro do endereço; máximo de 100 caracteres. | `City is required.` / `City must have at most 100 characters.` | `A cidade é obrigatória.` / `A cidade deve ter no máximo 100 caracteres.` |
| `address.state` | Obrigatório dentro do endereço; deve ser uma UF brasileira válida (duas letras). | `State is required.` / `State must be a valid Brazilian UF.` | `O estado é obrigatório.` / `O estado deve ser uma UF brasileira válida.` |
| `page` | Inteiro maior ou igual a zero; padrão `0`. | `Page must be zero or greater.` | `A página deve ser maior ou igual a zero.` |
| `size` | Inteiro entre 1 e 100; padrão `20`. | `Size must be between 1 and 100.` | `O tamanho deve estar entre 1 e 100.` |

Os telefones aceitam telefone fixo (DDD + 8 dígitos, começando de 2 a 5) ou celular (DDD + 9 dígitos, começando por 9), com formatação usual e prefixo `+55` opcional. A validação considera os DDDs brasileiros. Valores vazios em campos opcionais são tratados como ausência; campos obrigatórios em branco retornam o erro de obrigatoriedade.

Exemplo de resposta com múltiplos erros de validação:

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed.",
  "path": "/api/v1/customers",
  "errors": [
    {
      "field": "fullName",
      "message": "Full name must have between 3 and 150 characters."
    },
    {
      "field": "address.state",
      "message": "State must be a valid Brazilian UF."
    }
  ]
}
```

## Tratamento recomendado no frontend

- Em `201` e `200`, use `data` conforme a operação; na exclusão, a resposta não contém `data`.
- Em `400` com `VALIDATION_ERROR`, mapeie `errors[].field` aos campos e mostre `errors[].message`.
- Em outros erros com `errors`, use também os detalhes de campo, especialmente conflitos `409`.
- Use `code` para comportamentos específicos, como tratar `CUSTOMER_ALREADY_EXISTS` ou `CUSTOMER_NOT_FOUND`; não compare o texto localizado de `message`.
- Se não houver `errors`, mostre `message` como feedback geral. Para `500`, não exponha detalhes técnicos.

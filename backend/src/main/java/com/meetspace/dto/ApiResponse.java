package com.meetspace.dto;
import java.util.List;
public record ApiResponse<T>(boolean success, String code, String message, T data, List<String> errors) {
 public static <T> ApiResponse<T> ok(String message,T data){return new ApiResponse<>(true,null,message,data,List.of());}
 public static ApiResponse<Void> error(String code,String message,List<String> errors){return new ApiResponse<>(false,code,message,null,errors);}
}